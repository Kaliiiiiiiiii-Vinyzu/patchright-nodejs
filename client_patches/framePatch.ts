import { type Project, SyntaxKind } from "ts-morph";
import { assertDefined } from "./utils.ts";

// ---------------
// client/frame.ts
// ---------------
export function patchFrame(project: Project) {
	// Add source file to the project
	const frameSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/frame.ts");

	// ------- Frame Class -------
	const frameClass = frameSourceFile.getClassOrThrow("Frame");
	
	// -- waitForURL Method --
	const waitForURLMethod = frameClass.getMethodOrThrow("waitForURL");
	waitForURLMethod.setBodyText(`
	  if (urlMatches(this._page?.context()._options.baseURL, this.url(), url))
	    return await this.waitForLoadState(options.waitUntil, options);
	  try {
	    await this.waitForNavigation({ url, ...options });
	  } catch (error) {
	    if (urlMatches(this._page?.context()._options.baseURL, this.url(), url)) {
	      await this.waitForLoadState(options.waitUntil, options);
	      return;
	    }
	    throw error;
	  }
	`);

	// -- evaluate Method --
	const evaluateMethod = frameClass.getMethodOrThrow("evaluate");
	evaluateMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateAssertCall = assertDefined(
		evaluateMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("assertMaxArguments")
		)
	);
	evaluateAssertCall.replaceWithText(evaluateAssertCall.getText().replace("2", "3"));
	// Modify the function call inside the return statement to include 'isolatedContext'
	const evaluateExpressionCall = assertDefined(
		evaluateMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evaluateExpression")
		)
	);
	evaluateExpressionCall.replaceWithText(
		evaluateExpressionCall.getText().replace(
			/(\{[\s\S]*?arg:\s*serializeArgument\(arg\))/,
			"$1, isolatedContext: isolatedContext"
		)
	);

	// -- evaluateHandle Method --
	const evaluateHandleMethod = frameClass.getMethodOrThrow("evaluateHandle");
	evaluateHandleMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateHandleAssertCall = assertDefined(
		evaluateHandleMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("assertMaxArguments")
		)
	);
	evaluateHandleAssertCall.replaceWithText(evaluateHandleAssertCall.getText().replace("2", "3"));
	// Modify the function call inside the return statement to include 'isolatedContext'
	const evaluateHandleExpressionCall = assertDefined(
		evaluateHandleMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evaluateExpression")
		)
	);
	evaluateHandleExpressionCall.replaceWithText(
		evaluateHandleExpressionCall.getText().replace(
			/(\{[\s\S]*?arg:\s*serializeArgument\(arg\))/,
			"$1, isolatedContext: isolatedContext"
		)
	);

	// -- $$eval Method --
	const evalOnSelectorMethod = frameClass.getMethodOrThrow("$$eval");
	evalOnSelectorMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evalOnSelectorAssertCall = assertDefined(
		evalOnSelectorMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("assertMaxArguments")
		)
	);
	evalOnSelectorAssertCall.replaceWithText(evalOnSelectorAssertCall.getText().replace("3", "4"));
	// Modify the function call inside the return statement to include 'isolatedContext'
	const evalOnSelectorExpressionCall = assertDefined(
		evalOnSelectorMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evalOnSelectorAll")
		)
	);
	evalOnSelectorExpressionCall.replaceWithText(
		evalOnSelectorExpressionCall.getText().replace(
			/(\{[\s\S]*?arg:\s*serializeArgument\(arg\))/,
			"$1, isolatedContext: isolatedContext"
		)
	);
}
