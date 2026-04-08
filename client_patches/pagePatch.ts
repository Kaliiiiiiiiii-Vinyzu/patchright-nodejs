import { type Project, SyntaxKind } from "ts-morph";
import { assertDefined } from "./utils.ts";

// --------------
// client/page.ts
// --------------
export function patchPage(project: Project) {
	// Add source file to the project
	const pageSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/page.ts");

	// ------- Page Class -------
	const pageClass = pageSourceFile.getClassOrThrow("Page");
	pageClass.addProperty({ name: "routeInjecting", type: "boolean", initializer: "false" });
	
	// -- addInitScript Method --
	const addInitScriptMethod = pageClass.getMethodOrThrow("addInitScript");
	addInitScriptMethod.insertStatements(0, "await this.installInjectRoute();");
	
	// -- exposeBinding Method --
	const exposeBindingMethod = pageClass.getMethodOrThrow("exposeBinding");
	exposeBindingMethod.insertStatements(0, "await this.installInjectRoute();");
	
	// -- exposeFunction Method --
	const exposeFunctionMethod = pageClass.getMethodOrThrow("exposeFunction");
	exposeFunctionMethod.insertStatements(0, "await this.installInjectRoute();");
	
	// -- installInjectRoute Method --
	pageClass.addMethod({
		name: "installInjectRoute",
		isAsync: true,
	});
	const installInjectRouteMethod = pageClass.getMethodOrThrow("installInjectRoute");
	installInjectRouteMethod.setBodyText(`
		if (this.routeInjecting || this.context().routeInjecting) return;
		await this.route('**/*', async route => {
			try {
				if (route.request().resourceType() === 'document' && route.request().url().startsWith('http')) {
						await route.fallback({ patchrightInitScript: true } as any);
				} else {
						await route.fallback();
				}
		} catch (error) {
				await route.fallback();
			}
		});
		this.routeInjecting = true;
	`);
	
	// -- evaluate Method --
	const evaluateMethod = pageClass.getMethodOrThrow("evaluate");
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
	const evaluateReturnStatement = assertDefined(
		evaluateMethod.getFirstDescendant(node => node.isKind(SyntaxKind.ReturnStatement))
	);
	evaluateReturnStatement.replaceWithText(
		evaluateReturnStatement.getText().replace(
			"this._mainFrame.evaluate(pageFunction, arg)",
			"this._mainFrame.evaluate(pageFunction, arg, isolatedContext)"
		)
	);
	
	// -- evaluateHandle Method --
	const evaluateHandleMethod = pageClass.getMethodOrThrow("evaluateHandle");
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
	const evaluateHandleReturnStatement = assertDefined(
		evaluateHandleMethod.getFirstDescendant(node => node.isKind(SyntaxKind.ReturnStatement))
	);
	evaluateHandleReturnStatement.replaceWithText(
		evaluateHandleReturnStatement.getText().replace(
			"this._mainFrame.evaluateHandle(pageFunction, arg)",
			"this._mainFrame.evaluateHandle(pageFunction, arg, isolatedContext)"
		)
	);
}
