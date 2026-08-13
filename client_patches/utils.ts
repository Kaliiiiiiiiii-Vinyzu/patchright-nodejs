import { type CallExpression, Node } from "ts-morph";

export function assertDefined<T>(value: T | undefined | null, name?: string): T {
	if (value == null) throw new Error(`Required value${name ? ` "${name}"` : ""} is null or undefined`);
	return value;
}

// Bumps the numeric max-argument-count literal inside an `assertMaxArguments(arguments.length, N)`
// call by 1, regardless of what N currently is. A fixed string replace (e.g. "2" -> "3") is fragile:
// it silently no-ops whenever upstream Playwright has already changed N on its own (e.g. by adding a
// new `options` parameter before the one Patchright appends), leaving the count too low and causing
// the extra Patchright argument to be swallowed by whatever parameter comes right before it.
export function bumpAssertMaxArguments(call: CallExpression) {
	const countArg = call.getArguments()[1];
	if (!countArg) throw new Error(`assertMaxArguments call has no count argument: ${call.getText()}`);
	const current = Number(countArg.getText());
	if (Number.isNaN(current))
		throw new Error(`assertMaxArguments count is not a numeric literal: ${countArg.getText()}`);
	countArg.replaceWithText(String(current + 1));
}

// Adds a property (e.g. `isolatedContext: isolatedContext`) to the object-literal argument of a
// channel call (e.g. `this._channel.evaluateExpression({ ... }, kNoTimeout)`) via proper AST
// manipulation, rather than regex-matching the object literal's exact source text. The latter breaks
// silently (no error, property just never gets added) whenever upstream renames an inner expression,
// e.g. `arg: serializeArgument(arg)` becoming `arg: serializedArg`.
export function addChannelCallProperty(call: CallExpression, propertyName: string, propertyValue: string) {
	const objectArg = call.getArguments().find(Node.isObjectLiteralExpression);
	if (!objectArg) throw new Error(`Could not find object-literal argument in call: ${call.getText()}`);
	if (!objectArg.getProperty(propertyName)) objectArg.addPropertyAssignment({ name: propertyName, initializer: propertyValue });
}