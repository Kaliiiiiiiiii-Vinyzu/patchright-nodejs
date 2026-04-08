import { type Project, SyntaxKind } from "ts-morph";
import { assertDefined } from "./utils.ts";

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

	const applyFallbackOverridesMethod = requestClass.getMethodOrThrow("_applyFallbackOverrides");
	applyFallbackOverridesMethod.setBodyText(`
		if (overrides.url)
			this._fallbackOverrides.url = overrides.url;
		if (overrides.method)
			this._fallbackOverrides.method = overrides.method;
		if (overrides.headers)
			this._fallbackOverrides.headers = overrides.headers;
		if ((overrides as any).patchrightInitScript)
			(this._fallbackOverrides as any).patchrightInitScript = true;
		if (isString(overrides.postData))
			this._fallbackOverrides.postDataBuffer = Buffer.from(overrides.postData, "utf-8");
		else if (overrides.postData instanceof Buffer)
			this._fallbackOverrides.postDataBuffer = overrides.postData;
		else if (overrides.postData)
			this._fallbackOverrides.postDataBuffer = Buffer.from(JSON.stringify(overrides.postData), "utf-8");
	`);

	const routeClass = networkSourceFile.getClassOrThrow("Route");
	const innerContinueMethod = routeClass.getMethodOrThrow("_innerContinue");
	const innerContinueCall = assertDefined(
		innerContinueMethod.getFirstDescendant(node =>
			node.isKind(SyntaxKind.CallExpression) &&
			node.getExpression().getText() === "this._channel.continue"
		)
	).asKindOrThrow(SyntaxKind.CallExpression);
	const innerContinueOptions = innerContinueCall.getArguments()[0].asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
	if (!innerContinueOptions.getProperty("patchrightInitScript")) {
		innerContinueOptions.addPropertyAssignment({
			name: "patchrightInitScript",
			initializer: "(options as any).patchrightInitScript",
		});
	}
}
