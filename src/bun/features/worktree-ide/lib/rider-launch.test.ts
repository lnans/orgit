import { describe, expect, test } from "bun:test";
import {
	macOsBundledRiderCliCandidates,
	macOsOpenRiderAttempts,
	RIDER_MAC_APP_NAMES,
	RIDER_MAC_BUNDLE_ID,
} from "./rider-launch";

describe("macOsBundledRiderCliCandidates", () => {
	test("includes standard install locations", () => {
		const candidates = macOsBundledRiderCliCandidates("/Users/test");
		expect(candidates).toContain(
			"/Applications/Rider.app/Contents/MacOS/rider",
		);
		expect(candidates).toContain(
			"/Users/test/Applications/Rider.app/Contents/MacOS/rider",
		);
	});
});

describe("macOsOpenRiderAttempts", () => {
	test("tries bundle id before application names", () => {
		const attempts = macOsOpenRiderAttempts("/tmp/App.sln");
		expect(attempts[0]).toEqual([
			"/usr/bin/open",
			"-b",
			RIDER_MAC_BUNDLE_ID,
			"/tmp/App.sln",
		]);

		const appNameAttempts = attempts.slice(1);
		expect(appNameAttempts).toHaveLength(RIDER_MAC_APP_NAMES.length);
		for (const [index, appName] of RIDER_MAC_APP_NAMES.entries()) {
			expect(appNameAttempts[index]).toEqual([
				"/usr/bin/open",
				"-a",
				appName,
				"/tmp/App.sln",
			]);
		}
	});
});
