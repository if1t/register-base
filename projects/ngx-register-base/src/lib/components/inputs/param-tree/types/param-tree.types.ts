import { TuiHandler } from '@taiga-ui/cdk';
import { TuiTreeLoader } from '@taiga-ui/kit';

export interface SmaTreeLoader<T> extends TuiTreeLoader<T> {
  equals(value1: T, value2: T): boolean;
}

/** Конфиг для подгрузки дочерних узлов */
export interface ILoadConfig<T> {
  /** Узел для которого происходит загрузка */
  node: ITreeNode<T>;
  /** Дополнительная конфигурация загрузки */
  config?: {
    /** Является ли текущая загрузка начальной (для инициализации верхнего уровня узлов) */
    initial?: boolean;
    /**
     * Режим загрузки дочерних узлов.
     * Если true - дочерние узлы загружаются рекурсивно до последнего уровня
     * */
    opened?: boolean;
  };
}

export interface ITreeNode<T = any> {
  /** Название узла */
  name: string;
  parent?: ITreeNode<T>;
  /** Есть дочерние узлы которые можно загрузить */
  haveChildren?: boolean;
  /** Дочерние загруженные узлы */
  children?: ITreeNode<T>[];
  /** Дополнительные свойства узла */
  data?: T;
}

export type ChildrenHandlerType<NodeType> = TuiHandler<
  ITreeNode<NodeType>,
  readonly ITreeNode<NodeType>[]
>;
