import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopologyControlbarHighlightComponent } from './topology-controlbar-highlight.component';

describe('TopologyControlbarHighlightComponent', () => {
  let component: TopologyControlbarHighlightComponent;
  let fixture: ComponentFixture<TopologyControlbarHighlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopologyControlbarHighlightComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopologyControlbarHighlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
