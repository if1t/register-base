import { ParamTreeService } from '../services/param-tree.service';
import { ITreeNode } from '../types/param-tree.types';

export const TREE_LOADER: ITreeNode = { name: 'LOADING' };

export const notEmpty: (children?: ITreeNode[]) => boolean = (children) =>
  !!children && children.length > 0 && children[0] !== TREE_LOADER;

function getCurrentChildren<T>(node: ITreeNode<T>, service: ParamTreeService<T>): ITreeNode<T>[] {
  const serviceChildren = service.getChildren(node);
  if (notEmpty(serviceChildren)) {
    return serviceChildren;
  }

  return [];
}

export function treeNodesFlatten<T>(
  node: ITreeNode<T>,
  service: ParamTreeService<T>
): ITreeNode<T>[] {
  const children = getCurrentChildren(node, service);
  const flattenedChildren: ITreeNode<T>[] = [node];

  for (const child of children) {
    const flattened = treeNodesFlatten<T>(child, service);
    flattenedChildren.push(...flattened);
  }

  return flattenedChildren;
}

export function updatesCheckedNodesEqual<T>(
  prev: ITreeNode<T>[] | undefined,
  curr: ITreeNode<T>[] | undefined,
  service: ParamTreeService<T>
): boolean {
  if (!prev && !curr) {
    return true;
  }

  if (!prev || !curr) {
    return false;
  }

  if (prev.length !== curr.length) {
    return false;
  }

  for (const [i] of prev.entries()) {
    if (!service.equals(prev[i], curr[i])) {
      return false;
    }
  }

  return true;
}
