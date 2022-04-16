import { MultiBar, SingleBar } from 'cli-progress'
import { times, set, get } from 'lodash'
import IProgressBarItem from './IProgressBarItem'

/**
 * Adapter to simplize implementation of CLI Progress
 */
export default class ProgressBar {
  private readonly renderer: MultiBar
  private readonly bars: SingleBar[] = []
  data: IProgressBarItem[] = []

  constructor (data: IProgressBarItem[] = [], options: any = {}) {
    this.renderer = new MultiBar(options)
    this.merge(data)
  }

  merge (newData: IProgressBarItem[]): void {
    const data = newData.filter(Boolean)
    const addedCount = data.length - this.data.length
    const removedCount = this.data.length - data.length

    this.data = data.slice()

    // times detect values > 0
    times(addedCount, () => this.bars.push(this.renderer.create(0, 0)))
    times(removedCount, () => {
      const lastBar = this.bars.pop()

      if (lastBar instanceof SingleBar) {
        this.renderer.remove(lastBar)
      }
    })

    this.data.forEach(({ total, current, title, ...other }, idx) => {
      const bar = this.bars[idx]

      bar.setTotal(total)
      bar.update(current, { title, ...other })
    })
  }

  update (path: string, value: string): void {
    const currentValue = get(this.data, path) as string

    if (currentValue !== undefined && currentValue !== value) {
      const newData = this.data.slice()

      set(newData, path, value)

      this.merge(newData)
    }
  }

  stop (): void {
    this.renderer.stop()
  }
}
