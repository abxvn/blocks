import { TaskFn } from './TaskFn'
import TaskStatus from './TaskStatus'

export default interface ITask {
  id: string
  fn: TaskFn<Promise<any>>
  status: TaskStatus
  error?: Error

  /**
   * Ids of other tasks
   */
  dependencies: string[]
}
