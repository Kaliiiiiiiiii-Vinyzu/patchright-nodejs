import type { Project } from "ts-morph";

// -----------------
// client/locator.ts
// -----------------
export function patchLocator(project: Project) {
	// Add source file to the project
	const locatorSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/locator.ts");

	// Add the custom import and comment at the start of the file
	locatorSourceFile.addImportDeclaration({
		namedImports: ["JSHandle", "parseResult", "serializeArgument"],
		moduleSpecifier: "./jsHandle",
	});

	// ------- Locator Class -------
	const locatorClass = locatorSourceFile.getClassOrThrow("Locator");
	
	// -- evaluate Method --
	const evaluateMethod = locatorClass.getMethodOrThrow("evaluate");
	evaluateMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	evaluateMethod.setBodyText(`
		if (typeof options === 'boolean') {
			isolatedContext = options;
			options = undefined;
		}
		return await this._withElement(
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
			{ title: "Evaluate", timeout: options?.timeout }
		);
	`);

	// -- evaluateHandle Method --
	const evaluateHandleMethod = locatorClass.getMethodOrThrow("evaluateHandle");
	evaluateHandleMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	evaluateHandleMethod.setBodyText(`
		if (typeof options === 'boolean') {
			isolatedContext = options;
			options = undefined;
		}
		return await this._withElement(
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
			{ title: "Evaluate", timeout: options?.timeout }
		);
	`);

	// -- evaluateAll Method --
	const evaluateAllMethod = locatorClass.getMethodOrThrow("evaluateAll");
	evaluateAllMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
	evaluateAllMethod.setBodyText(`
		return await this._frame.$$eval(this._selector, pageFunction, arg, isolatedContext);
	`);


}
