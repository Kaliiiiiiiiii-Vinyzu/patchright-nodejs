import fs from "node:fs/promises";
import { Project, SyntaxKind, IndentationText } from "ts-morph";
import YAML from "yaml";

const project = new Project({
  manipulationSettings: {
    indentationText: IndentationText.TwoSpaces,
  },
});



// ----------------------------
// client/clientHelper.ts
// ----------------------------
const clientHelperSourceFile = project.addSourceFileAtPath(
  "packages/playwright-core/src/client/clientHelper.ts",
);
// ------- addSourceUrlToScript Function -------
const addSourceUrlToScriptFunction = clientHelperSourceFile.getFunction("addSourceUrlToScript");
addSourceUrlToScriptFunction.setBodyText(`return source`);

// ----------------------------
// client/browserContext.ts
// ----------------------------
const clientBrowserContextSourceFile = project.addSourceFileAtPath(
  "packages/playwright-core/src/client/browserContext.ts",
);
// ------- BrowserContext Class -------
const clientBrowserContextClass = clientBrowserContextSourceFile.getClass("BrowserContext");
clientBrowserContextClass.addProperty({ name: "routeInjecting", type: "boolean", initializer: "false" });

// -- addInitScript Method --
const clientAddInitScriptMethod = clientBrowserContextClass.getMethod("addInitScript");
const clientAddInitScriptMethodBody = clientAddInitScriptMethod.getBody();
clientAddInitScriptMethodBody.insertStatements(0, "await this.installInjectRoute();");

// -- exposeBinding Method --
const clientExposeBindingMethod = clientBrowserContextClass.getMethod("exposeBinding");
const clientExposeBindingMethodBody = clientExposeBindingMethod.getBody();
clientExposeBindingMethodBody.insertStatements(0, "await this.installInjectRoute();");

// -- exposeFunction Method --
const clientExposeFunctionMethod = clientBrowserContextClass.getMethod("exposeFunction");
const clientExposeFunctionMethodBody = clientExposeFunctionMethod.getBody();
clientExposeFunctionMethodBody.insertStatements(0, "await this.installInjectRoute();");

// -- installInjectRoute Method --
clientBrowserContextClass.addMethod({
  name: "installInjectRoute",
  isAsync: true,
});
const clientBrowserContextInstallInjectRouteMethod = clientBrowserContextClass.getMethod("installInjectRoute");
clientBrowserContextInstallInjectRouteMethod.setBodyText(`if (this.routeInjecting) return;
  await this.route('**/*', async route => {
    try {
      if (route.request().resourceType() === 'document' && route.request().url().startsWith('http')) {
          const protocol = route.request().url().split(':')[0];
          await route.fallback({ url: protocol + '://patchright-init-script-inject.internal/' });
      } else {
          await route.fallback();
      }
  } catch (error) {
      await route.fallback();
  }
});`);

// ----------------------------
// client/page.ts
// ----------------------------
const clientPageSourceFile = project.addSourceFileAtPath(
  "packages/playwright-core/src/client/page.ts",
);
// ------- Page Class -------
const clientPageClass = clientPageSourceFile.getClass("Page");
clientPageClass.addProperty({ name: "routeInjecting", type: "boolean", initializer: "false" });

// -- addInitScript Method --
const clientPageAddInitScriptMethod = clientPageClass.getMethod("addInitScript");
const clientPageAddInitScriptMethodBody = clientPageAddInitScriptMethod.getBody();
clientPageAddInitScriptMethodBody.insertStatements(0, "await this.installInjectRoute();");

// -- exposeBinding Method --
const clientPageExposeBindingMethod = clientPageClass.getMethod("exposeBinding");
const clientPageExposeBindingMethodBody = clientPageExposeBindingMethod.getBody();
clientPageExposeBindingMethodBody.insertStatements(0, "await this.installInjectRoute();");

// -- exposeFunction Method --
const clientPageExposeFunctionMethod = clientPageClass.getMethod("exposeFunction");
const clientPageExposeFunctionMethodBody = clientPageExposeFunctionMethod.getBody();
clientPageExposeFunctionMethodBody.insertStatements(0, "await this.installInjectRoute();");

// -- installInjectRoute Method --
clientPageClass.addMethod({
  name: "installInjectRoute",
  isAsync: true,
});
const clientPageInstallInjectRouteMethod = clientPageClass.getMethod("installInjectRoute");
clientPageInstallInjectRouteMethod.setBodyText(`if (this.routeInjecting || this.context().routeInjecting) return;
await this.route('**/*', async route => {
  try {
    if (route.request().resourceType() === 'document' && route.request().url().startsWith('http')) {
        const protocol = route.request().url().split(':')[0];
        await route.fallback({ url: protocol + '://patchright-init-script-inject.internal/' });
    } else {
        await route.fallback();
    }
} catch (error) {
    await route.fallback();
  }
});`);

// -- evaluate Method --
const clientPageEvaluateMethod = clientPageClass.getMethod("evaluate");
clientPageEvaluateMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
const clientPageEvaluateAssertCall = clientPageEvaluateMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("assertMaxArguments")
);
if (clientPageEvaluateAssertCall) {
  clientPageEvaluateAssertCall.replaceWithText(clientPageEvaluateAssertCall.getText().replace("2", "3"));
}
// Modify the function call inside the return statement to include 'isolatedContext'
const clientPageEvaluateReturnStatement = clientPageEvaluateMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.ReturnStatement)
);
if (clientPageEvaluateReturnStatement) {
  clientPageEvaluateReturnStatement.replaceWithText(
    clientPageEvaluateReturnStatement.getText().replace(
          "this._mainFrame.evaluate(pageFunction, arg)",
          "this._mainFrame.evaluate(pageFunction, arg, isolatedContext)"
      )
  );
}

// -- evaluateHandle Method --
const clientPageEvaluateHandleMethod = clientPageClass.getMethod("evaluateHandle");
clientPageEvaluateHandleMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
const clientPageEvaluateHandlAssertCall = clientPageEvaluateHandleMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("assertMaxArguments")
);
if (clientPageEvaluateHandlAssertCall) {
  clientPageEvaluateHandlAssertCall.replaceWithText(clientPageEvaluateHandlAssertCall.getText().replace("2", "3"));
}
// Modify the function call inside the return statement to include 'isolatedContext'
const clientPageEvaluateHandleReturnStatement = clientPageEvaluateHandleMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.ReturnStatement)
);
if (clientPageEvaluateHandleReturnStatement) {
  clientPageEvaluateHandleReturnStatement.replaceWithText(
    clientPageEvaluateHandleReturnStatement.getText().replace(
          "this._mainFrame.evaluateHandle(pageFunction, arg)",
          "this._mainFrame.evaluateHandle(pageFunction, arg, isolatedContext)"
      )
  );
}

// ----------------------------
// client/clock.ts
// ----------------------------
const clientClockSourceFile = project.addSourceFileAtPath(
  "packages/playwright-core/src/client/clock.ts",
);
// ------- Page Class -------
const clientClockClass = clientClockSourceFile.getClass("Clock");
// -- install Method --
const clientInstallMethod = clientClockClass.getMethod("install");
const clientInstallMethodBody = clientInstallMethod.getBody();
clientInstallMethodBody.insertStatements(0, "await this._browserContext.installInjectRoute()");

// ----------------------------
// client/worker.ts
// ----------------------------
const workerSourceFile = project.addSourceFileAtPath(
  "packages/playwright-core/src/client/worker.ts",
);
// ------- Worker Class -------
const clientWorkerClass = workerSourceFile.getClass("Worker");
// -- evaluate Method --
const workerEvaluateMethod = clientWorkerClass.getMethod("evaluate");
workerEvaluateMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
const workerEvaluateAssertCall = workerEvaluateMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("assertMaxArguments")
);
if (workerEvaluateAssertCall) {
  workerEvaluateAssertCall.replaceWithText(workerEvaluateAssertCall.getText().replace("2", "3"));
}
// Modify the function call inside the return statement to include 'isolatedContext'
const workerEvaluateExpressionCall = workerEvaluateMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("this._channel.evaluateExpression")
);

if (workerEvaluateExpressionCall) {
  workerEvaluateExpressionCall.replaceWithText(
    workerEvaluateExpressionCall.getText().replace(
          /(\{[\s\S]*?arg:\s*serializeArgument\(arg\))/,
          "$1, isolatedContext: isolatedContext"
      )
  );
}

// -- evaluateHandle Method --
const workerEvaluateHandleMethod = clientWorkerClass.getMethod("evaluateHandle");
workerEvaluateHandleMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
const workerEvaluateHandleAssertCall = workerEvaluateHandleMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("assertMaxArguments")
);
if (workerEvaluateHandleAssertCall) {
  workerEvaluateHandleAssertCall.replaceWithText(workerEvaluateHandleAssertCall.getText().replace("2", "3"));
}
// Modify the function call inside the return statement to include 'isolatedContext'
const workerEvaluateHandleExpressionCall = workerEvaluateHandleMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("this._channel.evaluateExpression")
);

if (workerEvaluateHandleExpressionCall) {
  workerEvaluateHandleExpressionCall.replaceWithText(
    workerEvaluateHandleExpressionCall.getText().replace(
          /(\{[\s\S]*?arg:\s*serializeArgument\(arg\))/,
          "$1, isolatedContext: isolatedContext"
      )
  );
}

// ----------------------------
// client/frame.ts
// ----------------------------
const frameSourceFile = project.addSourceFileAtPath(
  "packages/playwright-core/src/client/frame.ts",
);
// ------- Frame Class -------
const clientFrameClass = frameSourceFile.getClass("Frame");
// -- evaluate Method --
const frameEvaluateMethod = clientFrameClass.getMethod("evaluate");
frameEvaluateMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
const frameEvaluateAssertCall = frameEvaluateMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("assertMaxArguments")
);
if (frameEvaluateAssertCall) {
  frameEvaluateAssertCall.replaceWithText(frameEvaluateAssertCall.getText().replace("2", "3"));
}
// Modify the function call inside the return statement to include 'isolatedContext'
const clientFrameEvaluateExpressionCall = frameEvaluateMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("this._channel.evaluateExpression")
);

if (clientFrameEvaluateExpressionCall) {
  clientFrameEvaluateExpressionCall.replaceWithText(
    clientFrameEvaluateExpressionCall.getText().replace(
          /(\{[\s\S]*?arg:\s*serializeArgument\(arg\))/,
          "$1, isolatedContext: isolatedContext"
      )
  );
}

// -- evaluateHandle Method --
const frameEvaluateHandleMethod = clientFrameClass.getMethod("evaluateHandle");
frameEvaluateHandleMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
const frameEvaluateHandleAssertCall = frameEvaluateHandleMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("assertMaxArguments")
);
if (frameEvaluateHandleAssertCall) {
  frameEvaluateHandleAssertCall.replaceWithText(frameEvaluateHandleAssertCall.getText().replace("2", "3"));
}
// Modify the function call inside the return statement to include 'isolatedContext'
const frameEvaluateHandleExpressionCall = frameEvaluateHandleMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("this._channel.evaluateExpression")
);

if (frameEvaluateHandleExpressionCall) {
  frameEvaluateHandleExpressionCall.replaceWithText(
    frameEvaluateHandleExpressionCall.getText().replace(
          /(\{[\s\S]*?arg:\s*serializeArgument\(arg\))/,
          "$1, isolatedContext: isolatedContext"
      )
  );
}

// -- $$eval Method --
const frameEvalOnSelectorMethod = clientFrameClass.getMethod("$$eval");
frameEvalOnSelectorMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
const frameEvalOnSelectorAssertCall = frameEvalOnSelectorMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("assertMaxArguments")
);
if (frameEvalOnSelectorAssertCall) {
  frameEvalOnSelectorAssertCall.replaceWithText(frameEvalOnSelectorAssertCall.getText().replace("3", "4"));
}
// Modify the function call inside the return statement to include 'isolatedContext'
const frameEvalOnSelectorExpressionCall = frameEvalOnSelectorMethod.getFirstDescendant(node =>
  node.isKind(SyntaxKind.CallExpression) &&
  node.getText().includes("this._channel.evalOnSelectorAll")
);

if (frameEvalOnSelectorExpressionCall) {
  frameEvalOnSelectorExpressionCall.replaceWithText(
    frameEvalOnSelectorExpressionCall.getText().replace(
          /(\{[\s\S]*?arg:\s*serializeArgument\(arg\))/,
          "$1, isolatedContext: isolatedContext"
      )
  );
}

// ----------------------------
// client/locator.ts
// ----------------------------
const locatorSourceFile = project.addSourceFileAtPath(
  "packages/playwright-core/src/client/locator.ts",
);
// Add the custom import and comment at the start of the file
locatorSourceFile.insertStatements(0, [
  "// undetected-undetected_playwright-patch - custom imports",
  "import { JSHandle  } from './jsHandle';",
  "",
]);
// ------- Locator Class -------
const locatorClass = locatorSourceFile.getClass("Locator");
// -- evaluate Method --
const locatorEvaluateMethod = locatorClass.getMethod("evaluate");
locatorEvaluateMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
locatorEvaluateMethod.setBodyText(`return await this._withElement(
      async (h) =>
        parseResult(
          (
            await h._channel.evaluateExpression({
              expression: String(pageFunction),
              isFunction: typeof pageFunction === "function",
              arg: serializeArgument(arg),
              isolatedContext: isolatedContext,
            })
          ).value
        ),
      options?.timeout
    );`)

// -- evaluateHandle Method --
const locatorEvaluateHandleMethod = locatorClass.getMethod("evaluateHandle");
locatorEvaluateHandleMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
locatorEvaluateHandleMethod.setBodyText(`return await this._withElement(
  async (h) =>
    JSHandle.from(
      (
        await h._channel.evaluateExpressionHandle({
          expression: String(pageFunction),
          isFunction: typeof pageFunction === "function",
          arg: serializeArgument(arg),
          isolatedContext: isolatedContext,
        })
      ).handle
    ) as any as structs.SmartHandle<R>,
  options?.timeout
);`)

// -- evaluateAll Method --
const locatorEvaluateAllMethod = locatorClass.getMethod("evaluateAll");
locatorEvaluateAllMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
locatorEvaluateAllMethod.setBodyText(`return await this._frame.$$eval(this._selector, pageFunction, arg, isolatedContext);`)

// ----------------------------
// client/jsHandle.ts
// ----------------------------
const jsHandleSourceFile = project.addSourceFileAtPath(
  "packages/playwright-core/src/client/jsHandle.ts",
);
// ------- JSHandle Class -------
const clientJSHandleClass = jsHandleSourceFile.getClass("JSHandle");
// -- evaluate Method --
const jsHandleEvaluateMethod = clientJSHandleClass.getMethod("evaluate");
jsHandleEvaluateMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
jsHandleEvaluateMethod.setBodyText(`const result = await this._channel.evaluateExpression({ expression: String(pageFunction), isFunction: typeof pageFunction === 'function', arg: serializeArgument(arg), isolatedContext: isolatedContext });
    return parseResult(result.value);`)

// -- evaluateHandle Method --
const jsHandleEvaluateHandleMethod = clientJSHandleClass.getMethod("evaluateHandle");
jsHandleEvaluateHandleMethod.addParameter({
  name: "isolatedContext",
  type: "boolean",
  initializer: "true",
});
jsHandleEvaluateHandleMethod.setBodyText(`const result = await this._channel.evaluateExpressionHandle({ expression: String(pageFunction), isFunction: typeof pageFunction === 'function', arg: serializeArgument(arg), isolatedContext: isolatedContext });
    return JSHandle.from(result.handle) as any as structs.SmartHandle<R>;`)


// Here the Driver Patch will be added by fetching the code from the main Driver Repository (in the workflow).
// The URL from which the code is added is: https://raw.githubusercontent.com/Kaliiiiiiiiii-Vinyzu/patchright/refs/heads/main/patchright_driver_patch.js
// Note: The Project is also synced (saved) in this code, so we dont need to add it here.

