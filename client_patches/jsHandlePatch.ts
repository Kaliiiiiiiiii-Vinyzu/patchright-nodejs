import type { Project } from "ts-morph";

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
  evaluateMethod.setBodyText(`
    const result = await this._channel.evaluateExpression({
      expression: String(pageFunction),
      isFunction: typeof pageFunction === 'function',
      arg: serializeArgument(arg),
      isolatedContext: isolatedContext,
    });
    return parseResult(result.value);
  `);

	// -- evaluateHandle Method --
	const evaluateHandleMethod = jsHandleClass.getMethodOrThrow("evaluateHandle");
	evaluateHandleMethod.addParameter({
		name: "isolatedContext",
		type: "boolean",
		initializer: "true",
	});
  evaluateHandleMethod.setBodyText(`
    const result = await this._channel.evaluateExpressionHandle({
      expression: String(pageFunction),
      isFunction: typeof pageFunction === 'function',
      arg: serializeArgument(arg),
      isolatedContext: isolatedContext,
    });
    return JSHandle.from(result.handle) as any as structs.SmartHandle<R>;
  `);
}
