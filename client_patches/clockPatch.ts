import type { Project } from "ts-morph";

// ---------------
// client/clock.ts
// ---------------
export function patchClock(project: Project) {
	// Add source file to the project
	const clockSourceFile = project.addSourceFileAtPath("packages/playwright-core/src/client/clock.ts");

	// ------- Page Class -------
	const clockClass = clockSourceFile.getClassOrThrow("Clock");

	// -- install Method --
	const installMethod = clockClass.getMethodOrThrow("install");
	installMethod.insertStatements(0, "await this._browserContext.installInjectRoute()");
}
