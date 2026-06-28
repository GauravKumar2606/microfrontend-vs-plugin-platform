import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from 'shared-auth';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: { login: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authSpy = { login: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
  });

  it('calls authService.login with form values on submit', () => {
    authSpy.login.mockReturnValue(of({}));
    const component = fixture.componentInstance;
    component.username.set('teller1');
    component.password.set('pass123');
    component.onSubmit();
    expect(authSpy.login).toHaveBeenCalledWith({ username: 'teller1', password: 'pass123' });
  });

  it('navigates to / on successful login', () => {
    authSpy.login.mockReturnValue(of({}));
    fixture.componentInstance.onSubmit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('sets errorMessage on failed login', () => {
    authSpy.login.mockReturnValue(throwError(() => new Error('Unauthorized')));
    const component = fixture.componentInstance;
    component.onSubmit();
    expect(component.errorMessage()).toBe('Invalid username or password.');
  });
});
