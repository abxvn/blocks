import ITask from './ITask'
import { TaskFn } from './TaskFn'
import TaskStatus from './TaskStatus'

/**
 * Queues Kit - Task
 *
 * @author Hung Luu <hungluu2106@gmail.com>
 * @copyright TekuAsia (c) 2021
 * @version 1.0
 */
export default class Task implements ITask {
  status: TaskStatus = TaskStatus.PENDING
  error?: Error
  dependencies: string[] = []
  fn: TaskFn<Promise<any>>

  constructor (readonly id: string, private readonly process: TaskFn<any>, onDone?: (dependencies: ITask[]) => void) {
    if (onDone instanceof Function) {
      this.fn = async (dependencies: ITask[]) => await this.processAsync(dependencies).finally(() => onDone(dependencies))
    } else {
      this.fn = async (dependencies: ITask[]) => await this.processAsync(dependencies)
    }
  }

  async processAsync (dependencies: ITask[]): Promise<any> {
    return this.process(dependencies)
  }
}
