import type { Project } from "ts-morph";

// ----------------------
// client/clientHelper.ts
// ----------------------
export function patchClientHelper(project: Project) {
	// Add source file to the project
	const helperSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/clientHelper.ts");

	// ------- addSourceUrlToScript Function -------
	const addSourceUrlToScriptFunction = helperSourceFile.getFunctionOrThrow("addSourceUrlToScript");
	addSourceUrlToScriptFunction.setBodyText(`return source`);
}
