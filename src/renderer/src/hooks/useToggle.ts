import React, { type Dispatch, type SetStateAction } from "react";

export function useToggle(
	defaultValue?: boolean,
): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
	const [value, setValue] = React.useState(!!defaultValue);

	const toggle = React.useCallback(() => {
		setValue((x) => !x);
	}, []);

	return [value, toggle, setValue];
}
