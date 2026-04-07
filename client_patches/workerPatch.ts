import { type Project, SyntaxKind } from "ts-morph";
import { assertDefined } from "./utils.ts";

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
}
