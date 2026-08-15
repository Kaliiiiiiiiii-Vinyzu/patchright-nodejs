import { type CallExpression, Node, SyntaxKind } from "ts-morph";

export function assertDefined<T>(value: T | undefined | null, name?: string): T {
	if (value == null) throw new Error(`Required value${name ? ` "${name}"` : ""} is null or undefined`);
	return value;
}

export function bumpAssertMaxArguments(call: CallExpression) {
	const countArgument = assertDefined(call.getArguments()[1], "assertMaxArguments count").asKindOrThrow(
		SyntaxKind.NumericLiteral,
	);
	countArgument.setLiteralValue(countArgument.getLiteralValue() + 1);
}

export function addChannelCallProperty(call: CallExpression, name: string, initializer: string) {
	const objectArgument = assertDefined(
		call.getArguments().find(Node.isObjectLiteralExpression),
		"channel call options",
	);
	objectArgument.addPropertyAssignment({ name, initializer });
}
