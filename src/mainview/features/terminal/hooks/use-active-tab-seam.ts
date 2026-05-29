import { useLayoutEffect, useState } from "react";

/** Screen-space cover strip hiding the terminal top border under the active tab. */
export type ActiveTabSeam = {
	left: number;
	top: number;
	width: number;
};

/** Covers the terminal hairline plus subpixel gaps on retina displays. */
const SEAM_HEIGHT_PX = 3;

/** Inset from the active tab's left/right so side borders stay visible. */
const SEAM_INSET_X_PX = 1;

function measureSeam(
	activeTabEl: HTMLElement,
	containerEl: HTMLElement,
): ActiveTabSeam {
	const tabRect = activeTabEl.getBoundingClientRect();
	const containerRect = containerEl.getBoundingClientRect();
	const left = tabRect.left - containerRect.left + SEAM_INSET_X_PX;
	const width = Math.max(0, tabRect.width - SEAM_INSET_X_PX * 2);
	return {
		left,
		top: tabRect.bottom - containerRect.top - 1,
		width,
	};
}

/**
 * Tracks the active tab's bottom edge so a cover strip can hide the terminal
 * hairline only under that tab.
 */
export function useActiveTabSeam(
	activeTabEl: HTMLElement | null,
	containerEl: HTMLElement | null,
	scrollEl: HTMLElement | null,
): ActiveTabSeam | null {
	const [seam, setSeam] = useState<ActiveTabSeam | null>(null);

	useLayoutEffect(() => {
		if (!activeTabEl || !containerEl) {
			setSeam(null);
			return;
		}

		const update = () => {
			setSeam(measureSeam(activeTabEl, containerEl));
		};

		update();

		const resizeObserver = new ResizeObserver(update);
		resizeObserver.observe(activeTabEl);
		resizeObserver.observe(containerEl);
		if (scrollEl) {
			resizeObserver.observe(scrollEl);
		}

		scrollEl?.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);

		return () => {
			resizeObserver.disconnect();
			scrollEl?.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};
	}, [activeTabEl, containerEl, scrollEl]);

	return seam;
}

export { SEAM_HEIGHT_PX };
