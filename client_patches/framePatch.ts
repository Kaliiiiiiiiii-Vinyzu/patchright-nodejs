import { type Project, SyntaxKind } from "ts-morph";
import { addChannelCallProperty, assertDefined, bumpAssertMaxArguments } from "./utils.ts";

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
	).asKindOrThrow(SyntaxKind.CallExpression);
	bumpAssertMaxArguments(evaluateAssertCall);
	// Modify the function call inside the return statement to include 'isolatedContext'
	const evaluateExpressionCall = assertDefined(
		evaluateMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evaluateExpression")
		)
	).asKindOrThrow(SyntaxKind.CallExpression);
	addChannelCallProperty(evaluateExpressionCall, "isolatedContext", "isolatedContext");

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
	).asKindOrThrow(SyntaxKind.CallExpression);
	bumpAssertMaxArguments(evaluateHandleAssertCall);
	// Modify the function call inside the return statement to include 'isolatedContext'
	const evaluateHandleExpressionCall = assertDefined(
		evaluateHandleMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evaluateExpression")
		)
	).asKindOrThrow(SyntaxKind.CallExpression);
	addChannelCallProperty(evaluateHandleExpressionCall, "isolatedContext", "isolatedContext");

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
	).asKindOrThrow(SyntaxKind.CallExpression);
	bumpAssertMaxArguments(evalOnSelectorAssertCall);
	// Modify the function call inside the return statement to include 'isolatedContext'
	const evalOnSelectorExpressionCall = assertDefined(
		evalOnSelectorMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evalOnSelectorAll")
		)
	).asKindOrThrow(SyntaxKind.CallExpression);
	addChannelCallProperty(evalOnSelectorExpressionCall, "isolatedContext", "isolatedContext");
}
