import ITask from './ITask'

export type TaskFn<T> = (dependencies: ITask[]) => T
