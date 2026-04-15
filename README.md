<h1 align="center">
    🎭 Patchright NodeJS
</h1>


<p align="center">
    <a href="https://github.com/Kaliiiiiiiiii-Vinyzu/patchright-nodejs/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/License-Apache%202.0-green">
    </a>
    <a>
        <img src="https://img.shields.io/badge/Based%20on-Playwright-goldenrod">
    </a>
    <a>
        <img src="https://img.shields.io/badge/Driver-Patched-blue">
    </a>
    <img src="https://img.shields.io/github/actions/workflow/status/Kaliiiiiiiiii-Vinyzu/patchright/patchright_tests.yml?label=Patchright%20Driver%20Tests">
    <br/>
    <a href="https://www.npmjs.com/package/patchright">
        <img alt="npm version" src="https://img.shields.io/npm/v/patchright.svg">
    </a>
    <a href="https://github.com/Kaliiiiiiiiii-Vinyzu/patchright-nodejs">
        <img src="https://img.shields.io/badge/Package-NodeJS-seagreen">
    </a>
    <a href="https://github.com/Kaliiiiiiiiii-Vinyzu/patchright-nodejs/releases">
        <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/npm/d18m/patchright?color=red">
    </a>
</p>

#### Patchright is a patched and undetected version of the Playwright Testing and Automation Framework. </br> It can be used as a drop-in replacement for Playwright.

> [!NOTE]  
> This repository serves the Patchright-NodeJS Package. To use Patchright with Python, check out the [Python Package](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright-python).
> Also check out the main [Patchright Driver Repository](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright)

---

<details open>
    <summary><h3>Sponsors</h1></summary>

<sup>Want to Sponsor this Project? [Contact Me](https://discordapp.com/users/935224495126487150)!</sup>

</br>

[<img height="100" alt="swiftproxy banner" src="https://github.com/user-attachments/assets/123ac558-f99f-4c59-b826-b86822f2c92a" />](https://www.swiftproxy.net/?ref=Vinyzu)

#### [Swiftproxy](https://www.swiftproxy.net/?ref=Vinyzu): High-Performance Residential Proxies for Scalable Data Collection

Built for developers who need **reliable**, anti-detection proxy infrastructure. [Swiftproxy](https://www.swiftproxy.net/?ref=Vinyzu) delivers **stable connections**, **high success rates**, and flexible control for **large-scale scraping and automation**.

- 🌍 195+ locations with ethically sourced residential IPs
- 🔄 **Rotating** & **sticky sessions** with precise geo-targeting
- ⚡ Optimized for **anti-ban** & **high success rate**
- 🔌 HTTP / HTTPS / SOCKS5 support
- 🧪 **Free 500MB trial** for testing
- 💸 **Special discount** code for Patchright users: **PROXY90 - 10%**

<sup> Best for: Web scraping, automation, multi-accounting, and large-scale data extraction </sup>

---

[<img height="90" alt="rapidproxy banner" src="https://github.com/user-attachments/assets/bb771788-5c99-4e22-be40-c99cca95db22" />](https://www.rapidproxy.io/?ref=Vinyzu)


#### [RapidProxy](https://www.rapidproxy.io/?ref=Vinyzu) provides a stable and high-performance proxy network built for large-scale data operations.

[RapidProxy](https://www.rapidproxy.io/?ref=Vinyzu) delivers:
- 🌍 90M+ Residential IPs (200+ locations)
- 🔄 **Rotating Residential Proxies** — from **$0.65/GB** (non-expiring traffic)
- 🧩 **Static Residential IPs** — **$5/IP** (30 days, unlimited traffic)
- 🎯 Precise geo-targeting
- ⚡ **Free Trial Available** — test proxy performance risk-free
- Built for scraping, automation, and high-performance data workflows.
- 🔥 Special Offer: Use code **RAPID10** to get **10% off**

<sup> Start fast. Scale globally. Stay stable with [RapidProxy](https://www.rapidproxy.io/?ref=Vinyzu). </sup>

</details>

---

## Install it from NPM

```bash
# Install Patchright from NPM
npm i patchright
```

```bash
# Install Chromium-Driver for Patchright
npx patchright install chromium
```

---

## Usage
#### Just change the import and use it like playwright. Patchright is a drop-in-replacement for Playwright!

> [!IMPORTANT]  
> Patchright only patches CHROMIUM based browsers. Firefox and Webkit are not supported.

```js
// patchright here!
const { chromium } = require('patchright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://example.com');
  // other actions...
  await browser.close();
})();
```

### Best Practice  - use Chrome without Fingerprint Injection

To be completely undetected, use the following configuration:
```js
chromium.launchPersistentContext("...", {
    channel: "chrome",
    headless: false,
    viewport: null,
    // do NOT add custom browser headers or userAgent
});
```

> [!NOTE]
> We recommend using Google Chrome instead of Chromium.
> You can install it via `npx patchright install chrome` (or via any other installation method) and use it with `channel: "chrome"`.


---

## Patches

### [Runtime.enable](https://vanilla.aslushnikov.com/?Runtime.enable) Leak
This is the biggest Patch Patchright uses. To avoid detection by this leak, patchright avoids using [Runtime.enable](https://vanilla.aslushnikov.com/?Runtime.enable) by executing Javascript in (isolated) ExecutionContexts.

### [Console.enable](https://vanilla.aslushnikov.com/?Console.enable) Leak
Patchright patches this leak by disabling the Console API all together. This means, console functionality will not work in Patchright. If you really need the console, you might be better off using Javascript loggers, although they also can be easily detected.

### Command Flags Leaks
Patchright tweaks the Playwright Default Args to avoid detection by Command Flag Leaks. This (most importantly) affects:
- `--disable-blink-features=AutomationControlled` (added) to avoid navigator.webdriver detection.
- `--enable-automation` (removed) to avoid navigator.webdriver detection.
- `--disable-popup-blocking` (removed) to avoid popup crashing.
- `--disable-component-update` (removed) to avoid detection as a Stealth Driver.
- `--disable-default-apps` (removed) to enable default apps.
- `--disable-extensions` (removed) to enable extensions

### General Leaks
Patchright patches some general leaks in the Playwright codebase. This mainly includes poor setups and obvious detection points.

### Closed Shadow Roots
Patchright is able to interact with elements in Closed Shadow Roots. Just use normal locators and Patchright will do the rest.
<br/>
Patchright is now also able to use XPaths in Closed Shadow Roots.

---

## Stealth

With the right setup, Patchright currently is considered undetectable.
Patchright passes:
- [Brotector](https://kaliiiiiiiiii.github.io/brotector/) ✅ (with [CDP-Patches](https://github.com/Kaliiiiiiiiii-Vinyzu/CDP-Patches/))
- [Cloudflare](https://cloudflare.com/) ✅
- [Kasada](https://www.kasada.io/) ✅
- [Akamai](https://www.akamai.com/products/bot-manager/) ✅
- [Shape/F5](https://www.f5.com/) ✅
- [Bet365](https://bet365.com/) ✅
- [Datadome](https://datadome.co/products/bot-protection/) ✅
- [Fingerprint.com](https://fingerprint.com/products/bot-detection/) ✅
- [CreepJS](https://abrahamjuliot.github.io/creepjs/) ✅
- [Sannysoft](https://bot.sannysoft.com/) ✅
- [Incolumitas](https://bot.incolumitas.com/) ✅
- [IPHey](https://iphey.com/) ✅
- [Browserscan](https://browserscan.net/) ✅
- [Pixelscan](https://pixelscan.net/) ✅

---

## Documentation and API Reference
See the original [Playwright Documentation](https://playwright.dev/docs/intro) and [API Reference](https://playwright.dev/docs/api/class-playwright)

## Extended Patchright API
#### **`evaluate`** Method <sub>([`Frame.evaluate`](https://playwright.dev/docs/api/class-frame#frame-evaluate), [`Page.evaluate`](https://playwright.dev/docs/api/class-page#page-evaluate),  [`Locator.evaluate`](https://playwright.dev/docs/api/class-locator#locator-evaluate),  [`Worker.evaluate`](https://playwright.dev/docs/api/class-worker#worker-evaluate),  [`JSHandle.evaluate`](https://playwright.dev/docs/api/class-jshandle#js-handle-evaluate))</sub>
- Added `isolatedContext`  to choose Execution Context (Main/Isolated). `Bool` (*optional*, Defaults to `true`)
```diff
object.evaluate(
    pageFunction: Function | string,
    arg?: Arg,
    ...,
+   isolatedContext: boolean = true
)
```

#### **`evaluateHandle`** Method <sub>([`Frame.evaluateHandle`](https://playwright.dev/docs/api/class-frame#frame-evaluate-handle), [`Page.evaluateHandle`](https://playwright.dev/docs/api/class-page#page-evaluate-handle), [`Locator.evaluateHandle`](https://playwright.dev/docs/api/class-locator#locator-evaluate-handle), [`Worker.evaluateHandle`](https://playwright.dev/docs/api/class-worker#worker-evaluate-handle), [`JSHandle.evaluateHandle`](https://playwright.dev/docs/api/class-jshandle#js-handle-evaluate-handle))</sub>
- Added `isolatedContext`  to choose Execution Context (Main/Isolated). `Bool` (*optional*, Defaults to `true`)
```diff
object.evaluateHandle(
    pageFunction: Function | string,
    arg?: Arg,
    ...,
+   isolatedContext: boolean = true
)
```

#### **`evaluateAll`** Method <sub>([`Locator.evaluateAll`](https://playwright.dev/docs/api/class-locator#locator-evaluate-all))</sub>
- Added `isolated_context`  to choose Execution Context (Main/Isolated). `Bool` (*optional*, Defaults to `True`)
```diff
Locator.evaluateAll(
    pageFunction: Function | string,
    arg?: Arg,
    ...,
+   isolatedContext: boolean = true
)
```

---

## Bugs
#### The bugs are documented in the [Patchright Driver Repository](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright#bugs).

---

### TODO
#### The TODO is documented in the [Patchright Driver Repository](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright#todo).


---

## Development

Deployment of new Patchright versions are automatic, but bugs due to Playwright codebase changes may occur. Fixes for these bugs might take a few days to be released. 

---

## Support our work

If you choose to support our work, please contact [@vinyzu](https://discord.com/users/935224495126487150) or [@steve_abcdef](https://discord.com/users/936292409426477066) on Discord.

---

## Copyright and License
© [Vinyzu](https://github.com/Vinyzu/)

Patchright is licensed [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/)

---

## Disclaimer

This repository is provided for **educational purposes only**. \
No warranties are provided regarding accuracy, completeness, or suitability for any purpose. **Use at your own risk**—the authors and maintainers assume **no liability** for **any damages**, **legal issues**, or **warranty breaches** resulting from use, modification, or distribution of this code.\
**Any misuse or legal violations are the sole responsibility of the user**. 

---

## Authors

#### Active Maintainer: [Vinyzu](https://github.com/Vinyzu/) </br> Co-Maintainer: [Kaliiiiiiiiii](https://github.com/kaliiiiiiiiii/)
