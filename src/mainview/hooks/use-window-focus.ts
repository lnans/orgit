import { useEffect } from "react";

export function useWindowFocusOnMount() {
	useEffect(() => {
		window.focus();
	}, []);
}
