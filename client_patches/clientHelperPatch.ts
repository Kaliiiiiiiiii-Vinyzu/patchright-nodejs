import type { Project } from "ts-morph";

// ----------------------
// client/clientHelper.ts
// ----------------------
export function patchClientHelper(project: Project) {
	// Add source file to the project
	const helperSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/clientHelper.ts");
	const serializerImport = helperSourceFile.getImportDeclarationOrThrow("@isomorphic/utilityScriptSerializers");
	for (const name of ["kBindingsControllerProperty", "kFunctionBindingPrefix"])
		serializerImport.getNamedImports().find(namedImport => namedImport.getName() === name)?.remove();
	helperSourceFile.addImportDeclaration({
		moduleSpecifier: "../generated/utilityScriptSource",
		namespaceImport: "rawUtilityScriptSource",
	});

	// ------- initScriptSourceWithExposedFunctions Function -------
	const initScriptSourceWithExposedFunctionsFunction = helperSourceFile.getFunctionOrThrow(
		"initScriptSourceWithExposedFunctions",
	);
	initScriptSourceWithExposedFunctionsFunction.setBodyText(`
		const exposePromises: Promise<void>[] = [];
		const serialized = serializeAsCallArgument(arg, value => {
			if (typeof value === 'function') {
				const name = 'f' + createGuid();
				exposePromises.push(expose(name, value));
				return { fn: name, init: true };
			}
			return { fallThrough: value };
		});
		await Promise.all(exposePromises);
		return \`(() => {
			if (globalThis.document?.currentScript)
				return;
			const module = {};
			\${rawUtilityScriptSource.source}
			return new (module.exports.UtilityScript())(globalThis, false).evaluate(true, false, \${JSON.stringify(fun.toString())}, 1, \${JSON.stringify(serialized)});
		})()\`;
	`);

	// ------- addSourceUrlToScript Function -------
	const addSourceUrlToScriptFunction = helperSourceFile.getFunctionOrThrow("addSourceUrlToScript");
	addSourceUrlToScriptFunction.setBodyText(`return source`);
}
