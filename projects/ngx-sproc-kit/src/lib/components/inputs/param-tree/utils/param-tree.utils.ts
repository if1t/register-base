import { ITreeNode } from '../types/param-tree.types';

interface IArgs<T> {
  item: T;
  children?: ITreeNode<T>[];
}

export function transformItemToNode<T extends Record<string, any>>({
  item,
  children,
}: IArgs<T>): ITreeNode<T> {
  return {
    name: item['name'],
    haveChildren: !!children,
    children: children || [],
    data: item,
  };
}
