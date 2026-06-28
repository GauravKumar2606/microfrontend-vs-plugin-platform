import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth/auth.service';
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

  it('calls auth.login with form values on submit', () => {
    authSpy.login.mockReturnValue(of({}));
    const component = fixture.componentInstance;
    component.username.set('cust1');
    component.password.set('pass123');
    component.tenantId.set('BANK01');
    component.onSubmit();
    expect(authSpy.login).toHaveBeenCalledWith({ username: 'cust1', password: 'pass123', tenantId: 'BANK01' });
  });

  it('navigates to /dashboard on success', () => {
    authSpy.login.mockReturnValue(of({}));
    fixture.componentInstance.onSubmit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('sets errorMessage on failed login', () => {
    authSpy.login.mockReturnValue(throwError(() => new Error('Unauthorized')));
    const component = fixture.componentInstance;
    component.onSubmit();
    expect(component.errorMessage()).toBe('Invalid credentials.');
  });
});
