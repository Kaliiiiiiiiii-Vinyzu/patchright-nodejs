import { type Project, SyntaxKind } from "ts-morph";
import { addChannelCallProperty, assertDefined } from "./utils.ts";

// ------------------
// client/jsHandle.ts
// ------------------
export function patchJsHandle(project: Project) {
	// Add source file to the project
	const jsHandleSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/jsHandle.ts");

	// ------- JSHandle Class -------
	const jsHandleClass = jsHandleSourceFile.getClassOrThrow("JSHandle");

	// -- evaluate Method --
	// Note: we intentionally add the `isolatedContext` parameter and then only inject a single
	// property into the existing `_channel.evaluateExpression(...)` call (via AST, not text
	// replacement/full-body rewrite), so we don't clobber whatever upstream does around it
	// (e.g. assertEvaluateOptions, serializeArgumentWithCallbacks, the `kNoTimeout` argument).
	const evaluateMethod = jsHandleClass.getMethodOrThrow("evaluate");
	evaluateMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateExpressionCall = assertDefined(
		evaluateMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evaluateExpression")
		)
	).asKindOrThrow(SyntaxKind.CallExpression);
	addChannelCallProperty(evaluateExpressionCall, "isolatedContext", "isolatedContext");

	// -- evaluateHandle Method --
	const evaluateHandleMethod = jsHandleClass.getMethodOrThrow("evaluateHandle");
	evaluateHandleMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateHandleExpressionCall = assertDefined(
		evaluateHandleMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evaluateExpression")
		)
	).asKindOrThrow(SyntaxKind.CallExpression);
	addChannelCallProperty(evaluateHandleExpressionCall, "isolatedContext", "isolatedContext");
}
