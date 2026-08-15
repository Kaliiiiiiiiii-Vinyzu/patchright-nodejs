import { type Project, SyntaxKind } from "ts-morph";
import { assertDefined } from "./utils.ts";

// -----------------
// client/locator.ts
// -----------------
export function patchLocator(project: Project) {
	// Add source file to the project
	const locatorSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/locator.ts");

	// ------- Locator Class -------
	const locatorClass = locatorSourceFile.getClassOrThrow("Locator");
	
	// -- evaluate Method --
	const evaluateMethod = locatorClass.getMethodOrThrow("evaluate");
	evaluateMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateCall = assertDefined(
		evaluateMethod
			.getDescendantsOfKind(SyntaxKind.CallExpression)
			.find(call => call.getExpression().getText() === "h.evaluate")
	);
	evaluateCall.addArgument("isolatedContext");

	// -- evaluateHandle Method --
	const evaluateHandleMethod = locatorClass.getMethodOrThrow("evaluateHandle");
	evaluateHandleMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateHandleCall = assertDefined(
		evaluateHandleMethod
			.getDescendantsOfKind(SyntaxKind.CallExpression)
			.find(call => call.getExpression().getText() === "h.evaluateHandle")
	);
	evaluateHandleCall.addArgument("isolatedContext");

	// -- evaluateAll Method --
	const evaluateAllMethod = locatorClass.getMethodOrThrow("evaluateAll");
	evaluateAllMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateAllCall = assertDefined(
		evaluateAllMethod
			.getDescendantsOfKind(SyntaxKind.CallExpression)
			.find(call => call.getExpression().getText() === "this._frame.$$eval")
	);
	evaluateAllCall.addArgument("isolatedContext");
}
