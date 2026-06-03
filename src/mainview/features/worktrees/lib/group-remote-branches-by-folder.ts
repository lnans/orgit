import type { RemoteBranchOption } from "@shared/list-remote-branches";

/** One folder level in the remote-branch picker tree. */
export type RemoteBranchFolderNode = {
	/** Path segment; empty only on the synthetic root. */
	name: string;
	branches: RemoteBranchOption[];
	children: RemoteBranchFolderNode[];
};

function compareBranchNames(
	a: RemoteBranchOption,
	b: RemoteBranchOption,
): number {
	return a.branchName.localeCompare(b.branchName);
}

function compareFolderNodes(
	a: RemoteBranchFolderNode,
	b: RemoteBranchFolderNode,
): number {
	return a.name.localeCompare(b.name);
}

function sortFolderNode(node: RemoteBranchFolderNode): void {
	node.branches.sort(compareBranchNames);
	node.children.sort(compareFolderNodes);
	for (const child of node.children) {
		sortFolderNode(child);
	}
}

function findOrCreateChild(
	node: RemoteBranchFolderNode,
	segment: string,
): RemoteBranchFolderNode {
	const existing = node.children.find((child) => child.name === segment);
	if (existing) {
		return existing;
	}
	const created: RemoteBranchFolderNode = {
		name: segment,
		branches: [],
		children: [],
	};
	node.children.push(created);
	return created;
}

/**
 * Builds a folder tree from branch names (`release/1.0` → group `release`, item `1.0`).
 * Branches without `/` stay at the root; nested paths become nested groups.
 */
export function groupRemoteBranchesByFolder(
	branches: RemoteBranchOption[],
): RemoteBranchFolderNode {
	const root: RemoteBranchFolderNode = {
		name: "",
		branches: [],
		children: [],
	};

	for (const branch of branches) {
		const segments = branch.branchName.split("/");
		if (segments.length === 1) {
			root.branches.push(branch);
			continue;
		}

		let node = root;
		for (let index = 0; index < segments.length - 1; index++) {
			node = findOrCreateChild(node, segments[index] ?? "");
		}
		node.branches.push(branch);
	}

	sortFolderNode(root);
	return root;
}

/** Display label for a branch inside its parent folder group. */
export function remoteBranchItemLabel(branch: RemoteBranchOption): string {
	const segments = branch.branchName.split("/");
	return segments.at(-1) ?? branch.branchName;
}
