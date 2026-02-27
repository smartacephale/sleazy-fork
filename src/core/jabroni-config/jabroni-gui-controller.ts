import type { JabronioStore } from 'jabroni-outfit';
import { map, Subject, scan, shareReplay, takeUntil } from 'rxjs';
import type { DataManager } from '../data-handler';

interface DirectionalEventState {
  type?: string;
  direction: boolean;
}

export class JabronioGuiController {
  constructor(
    private store: JabronioStore,
    private dataManager: DataManager,
  ) {
    this.directionalEventObservable$ = this.directionalEvent();
    this.setupStoreListeners();
  }

  private readonly destroy$ = new Subject<void>();

  public dispose() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private directionalEventObservable$?: ReturnType<typeof this.directionalEvent>;

  private directionalEvent() {
    return this.store.eventSubject.pipe(
      scan(
        (acc: DirectionalEventState, value: string) => ({
          type: value,
          direction: acc.type === value ? !acc.direction : true,
        }),
        { type: undefined, direction: true },
      ),
      map(({ type, direction }) => ({
        type: type as keyof typeof this.eventsMap,
        direction,
      })),
      shareReplay(1),
      takeUntil(this.destroy$),
    );
  }

  private readonly eventsMap = {
    'sort by duration': (direction: boolean) =>
      this.dataManager.sortBy('duration', direction),
    'sort by views': (direction: boolean) => this.dataManager.sortBy('views', direction),
  } as const;

  private setupStoreListeners() {
    this.directionalEventObservable$?.subscribe((e) => {
      this.eventsMap[e.type](e.direction);
    });

    this.store.stateSubject.pipe(takeUntil(this.destroy$)).subscribe((a) => {
      this.dataManager.applyFilters(a as { [key: string]: boolean });
    });
  }
}
