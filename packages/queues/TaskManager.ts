import EventEmitter from 'events'

import ITask from './ITask'
import TaskStatus from './TaskStatus'

/**
 * Queues Kit - TaskManager
 *
 * Task Manager that handles tasks concurrently (based on concurrency setting)
 * and allow adding more tasks during operation
 *
 * @author Hung Luu <hungluu2106@gmail.com>
 * @copyright TekuAsia (c) 2021
 * @version 1.0
 */
export default class TaskManager extends EventEmitter {
  readonly tasks: ITask[] = []
  protected readonly successfulTasks: string[] = []

  constructor (readonly concurrency: number = 10) {
    super()
  }

  addTask (task: ITask): void {
    this.emit('task:add', task)
    this.tasks.push(task)
  }

  async processTask (task: ITask): Promise<any> {
    if (!this.shouldProcessTask(task)) {
      return
    }

    task.status = TaskStatus.RUNNING
    this.emit('task:start', task)

    try {
      const dependencies = this.tasks.filter(t => task.dependencies.includes(t.id))

      await task.fn(dependencies)
      this.successfulTasks.push(task.id)
      this.emit('task:success', task)
    } catch (err) {
      task.error = err
      this.emit('task:error', task)
    } finally {
      task.status = TaskStatus.DONE
      this.emit('task:done', task)

      this.processTasks()
    }
  }

  processTasks (): this {
    const pendingTasks = this.tasks.filter(task => task.status === TaskStatus.PENDING)

    pendingTasks.forEach(task => {
      this.processTask(task).catch(err => this.emit('error', err))
    })

    if (pendingTasks.length === 0 && !this.tasks.some(task => task.status === TaskStatus.RUNNING)) {
      // No running or pending tasks so considered all completed
      this.emit('done')
    }

    return this
  }

  getRunningCount (): number {
    return this.tasks.filter(task => task.status === TaskStatus.RUNNING).length
  }

  private shouldProcessTask (task: ITask): boolean {
    if (this.getRunningCount() >= this.concurrency) {
      return false
    }

    if (task.status !== TaskStatus.PENDING) {
      return false
    }

    const hasUncompletedDependencies = task.dependencies.some(id => !this.successfulTasks.includes(id))
    if (hasUncompletedDependencies) {
      return false
    }

    return true
  }
}
