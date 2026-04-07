import type { Project } from "ts-morph";

// -----------------
// client/network.ts
// -----------------
export function patchNetwork(project: Project) {
	// Add source file to the project
	const networkSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/network.ts");

	// Imports
	const errorsImport = networkSourceFile.getImportDeclaration((decl) => decl.getModuleSpecifierValue() === "./errors");
	const alreadyImported = errorsImport?.getNamedImports().some(i => i.getName() === "TargetClosedError");

	if (errorsImport && !alreadyImported) {
    errorsImport.addNamedImport("TargetClosedError");
	}

	// ------- Request Class -------
	const requestClass = networkSourceFile.getClassOrThrow("Request");

	// -- allHeaders Method --
	const allHeadersMethod = requestClass.getMethodOrThrow("allHeaders");
	allHeadersMethod.setBodyText(`
		const headers = await this._actualHeaders();
		const page = this._safePage();
		if (page?._closeWasCalled)
			throw new TargetClosedError();
		return headers.headers();
	`);
}
