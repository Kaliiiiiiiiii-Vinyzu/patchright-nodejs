import { type Project, SyntaxKind } from "ts-morph";
import { addChannelCallProperty, assertDefined, bumpAssertMaxArguments } from "./utils.ts";

// ----------------
// client/worker.ts
// ----------------
export function patchWorker(project: Project) {
	// Add source file to the project
	const workerSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/worker.ts");

	// ------- Worker Class -------
	const workerClass = workerSourceFile.getClassOrThrow("Worker");
	
	// -- evaluate Method --
	const evaluateMethod = workerClass.getMethodOrThrow("evaluate");
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
	bumpAssertMaxArguments(evaluateAssertCall.asKindOrThrow(SyntaxKind.CallExpression));
	// Modify the function call inside the return statement to include 'isolatedContext'
	const evaluateExpressionCall = assertDefined(
		evaluateMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evaluateExpression")
		)
	).asKindOrThrow(SyntaxKind.CallExpression);
	addChannelCallProperty(evaluateExpressionCall, "isolatedContext", "isolatedContext");
	
	// -- evaluateHandle Method --
	const evaluateHandleMethod = workerClass.getMethodOrThrow("evaluateHandle");
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
	bumpAssertMaxArguments(evaluateHandleAssertCall.asKindOrThrow(SyntaxKind.CallExpression));
	// Modify the function call inside the return statement to include 'isolatedContext'
	const evaluateHandleExpressionCall = assertDefined(
		evaluateHandleMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getText().includes("this._channel.evaluateExpression")
		)
	).asKindOrThrow(SyntaxKind.CallExpression);
	addChannelCallProperty(evaluateHandleExpressionCall, "isolatedContext", "isolatedContext");
}
