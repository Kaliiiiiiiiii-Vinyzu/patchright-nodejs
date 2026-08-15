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
	const evaluateMethod = jsHandleClass.getMethodOrThrow("evaluate");
	evaluateMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateExpressionCall = assertDefined(
		evaluateMethod
			.getDescendantsOfKind(SyntaxKind.CallExpression)
			.find(call => call.getExpression().getText() === "this._channel.evaluateExpression")
	);
	addChannelCallProperty(evaluateExpressionCall, "isolatedContext", "isolatedContext");

	// -- evaluateHandle Method --
	const evaluateHandleMethod = jsHandleClass.getMethodOrThrow("evaluateHandle");
	evaluateHandleMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	const evaluateHandleExpressionCall = assertDefined(
		evaluateHandleMethod
			.getDescendantsOfKind(SyntaxKind.CallExpression)
			.find(call => call.getExpression().getText() === "this._channel.evaluateExpressionHandle")
	);
	addChannelCallProperty(evaluateHandleExpressionCall, "isolatedContext", "isolatedContext");

	const serializerImport = jsHandleSourceFile.getImportDeclarationOrThrow("@isomorphic/utilityScriptSerializers");
	serializerImport.getNamedImports().find(namedImport => namedImport.getName() === "kFunctionBindingPrefix")?.remove();
	const serializeArgumentWithCallbacksFunction = jsHandleSourceFile.getFunctionOrThrow("serializeArgumentWithCallbacks");
	const callbackNameDeclaration = assertDefined(
		serializeArgumentWithCallbacksFunction
			.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
			.find(declaration => declaration.getName() === "name")
	);
	callbackNameDeclaration.setInitializer("'f' + createGuid()");
}
