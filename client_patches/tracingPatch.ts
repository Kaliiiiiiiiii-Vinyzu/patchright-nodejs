import type { Project } from "ts-morph";

// ----------------------
// client/tracing.ts
// ----------------------
export function patchTracing(project: Project) {
	// Add source file to the project
	const tracingSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/tracing.ts");

	// ------- Tracing Class -------
	const tracingClass = tracingSourceFile.getClassOrThrow("Tracing");

	// -- start Method --
	const startMethod = tracingClass.getMethodOrThrow("start");
	startMethod.insertStatements(0, "if (typeof this._parent.installInjectRoute === 'function') await this._parent.installInjectRoute();");
}
