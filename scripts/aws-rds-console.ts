import { chromium, type Page } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

type Args = {
  region: string;
  dbIdentifier: string;
  headless: boolean;
};

type Summary = {
  identifier: string;
  region: string;
  endpoint: string;
  port: string;
  status: string;
  engine: string;
  capturedAt: string;
  screenshotPath: string;
};

const LOGIN_TIMEOUT_MS = 10 * 60 * 1000;
const NAVIGATION_TIMEOUT_MS = 45 * 1000;

function parseArgs(): Args {
  const cliArgs = process.argv.slice(2);
  const lookup = new Map<string, string | boolean>();

  for (let index = 0; index < cliArgs.length; index += 1) {
    const token = cliArgs[index];
    if (token === "--headless") {
      lookup.set("headless", true);
      continue;
    }

    if (token.startsWith("--")) {
      const next = cliArgs[index + 1];
      if (!next || next.startsWith("--")) {
        throw new Error(`Missing value for argument: ${token}`);
      }
      lookup.set(token.replace(/^--/, ""), next);
      index += 1;
    }
  }

  const envHeadless = process.env.PLAYWRIGHT_HEADLESS === "true";
  const region = (lookup.get("region") as string) ?? process.env.AWS_REGION ?? "us-east-1";
  const dbIdentifier =
    (lookup.get("db-identifier") as string) ?? process.env.AWS_RDS_IDENTIFIER ?? "bible-app";
  const headless = Boolean(lookup.get("headless")) || envHeadless;

  return { region, dbIdentifier, headless };
}

function fail(message: string, code = 1): never {
  console.error(message);
  process.exit(code);
}

async function waitForConsoleLogin(page: Page): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < LOGIN_TIMEOUT_MS) {
    const currentUrl = page.url();
    const onConsoleDomain = currentUrl.includes("console.aws.amazon.com");
    const notOnSigninPath = !currentUrl.includes("signin.aws.amazon.com");
    const shellLoaded =
      (await page.getByText("AWS Management Console", { exact: false }).count()) > 0 ||
      (await page.locator("awsui-app-layout, #awsc-nav-header").count()) > 0;

    if (onConsoleDomain && notOnSigninPath && shellLoaded) {
      return;
    }

    await page.waitForTimeout(1500);
  }

  throw new Error("Login timeout: AWS console session was not detected within 10 minutes.");
}

async function openRdsDetails(page: Page, region: string, dbIdentifier: string): Promise<void> {
  const detailsUrl = `https://${region}.console.aws.amazon.com/rds/home?region=${region}#database:id=${encodeURIComponent(dbIdentifier)};is-cluster=false`;
  await page.goto(detailsUrl, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });

  const marker = page.getByText(dbIdentifier, { exact: true }).first();
  const statusLabel = page.getByText("DB instance status", { exact: false }).first();
  if ((await marker.count()) > 0 || (await statusLabel.count()) > 0) {
    return;
  }

  const listUrl = `https://${region}.console.aws.amazon.com/rds/home?region=${region}#databases:`;
  await page.goto(listUrl, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });

  const rowLink = page.getByRole("link", { name: dbIdentifier, exact: true });
  if ((await rowLink.count()) === 0) {
    throw new Error(`DB instance not found in region ${region}: ${dbIdentifier}`);
  }
  await rowLink.first().click();
  await page.waitForLoadState("domcontentloaded", { timeout: NAVIGATION_TIMEOUT_MS });
}

async function valueForLabel(page: Page, label: string): Promise<string> {
  const exact = page.locator(`xpath=//*[normalize-space(text())='${label}']/following::*[1]`).first();
  if ((await exact.count()) > 0) {
    const exactText = (await exact.textContent())?.trim();
    if (exactText) {
      return exactText;
    }
  }

  const loose = page
    .locator(`xpath=//*[contains(normalize-space(text()), '${label}')]/following::*[1]`)
    .first();
  if ((await loose.count()) > 0) {
    const looseText = (await loose.textContent())?.trim();
    if (looseText) {
      return looseText;
    }
  }

  return "unknown";
}

async function main(): Promise<void> {
  const { region, dbIdentifier, headless } = parseArgs();
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const signInUrl = `https://${region}.console.aws.amazon.com/console/home?region=${region}`;
    await page.goto(signInUrl, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
    console.error("Complete AWS root sign-in and MFA in the opened browser window.");

    await waitForConsoleLogin(page);
    await openRdsDetails(page, region, dbIdentifier);
    await page.waitForTimeout(2000);

    const endpointRaw = await valueForLabel(page, "Endpoint");
    const endpoint = endpointRaw.split(":")[0].trim();
    const port = await valueForLabel(page, "Port");
    const status = await valueForLabel(page, "DB instance status");
    const engine =
      (await valueForLabel(page, "Engine version")) !== "unknown"
        ? await valueForLabel(page, "Engine version")
        : await valueForLabel(page, "Engine");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotDir = path.join(process.cwd(), "output", "playwright");
    const screenshotPath = path.join(screenshotDir, `aws-rds-details-${timestamp}.png`);
    await mkdir(screenshotDir, { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const summary: Summary = {
      identifier: dbIdentifier,
      region,
      endpoint,
      port,
      status,
      engine,
      capturedAt: new Date().toISOString(),
      screenshotPath
    };

    console.log(JSON.stringify(summary));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found")) {
      fail(`DB not found error: ${message}`, 3);
    }
    if (message.includes("timeout")) {
      fail(`Timeout error: ${message}`, 2);
    }
    fail(`Page-shape or navigation error: ${message}`, 4);
  } finally {
    await context.close();
    await browser.close();
  }
}

void main();
