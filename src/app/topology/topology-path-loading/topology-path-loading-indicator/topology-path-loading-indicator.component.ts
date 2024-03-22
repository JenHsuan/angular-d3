import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoadingService } from '../loading.service';
import { NavigationEnd, NavigationError, NavigationStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

@Component({
  selector: 'app-topology-path-loading-indicator',
  templateUrl: './topology-path-loading-indicator.component.html',
  styleUrls: ['./topology-path-loading-indicator.component.scss']
})
export class LoadingIndicatorComponent implements OnInit {
  loading$: Observable<boolean>;

  @Input()
  detectNavigation = false;

  @ContentChild("loading")
  customLoadingIndicator: TemplateRef<any> | null = null;

  constructor(
  private loadingService: LoadingService, 
  private router: Router) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    if (this.detectNavigation) {
      this.router.events
        .pipe(
          tap((event) => {
            if (event instanceof NavigationStart) {
              this.loadingService.loadingOn();
            } else if (event instanceof NavigationEnd || event instanceof NavigationError) {
              this.loadingService.loadingOff();
            }
          })
        )
        .subscribe();
    }
  }

}
