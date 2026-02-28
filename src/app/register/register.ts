import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// ─────────────────────────────────────────────────────────────────
// REQUIREMENT 1: Password — alphanumeric, min 8, starts with letter
// ─────────────────────────────────────────────────────────────────
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val: string = control.value;
    if (!val) return null;
    if (!/^[A-Za-z]/.test(val))      return { startsWithLetter: true };
    if (!/^[A-Za-z0-9]+$/.test(val)) return { alphanumericOnly: true };
    if (val.length < 8)              return { tooShort: true };
    return null;
  };
}

// ─────────────────────────────────────────────────────────────────
// REQUIREMENT 2: Birth year — born 2006 or earlier
// ─────────────────────────────────────────────────────────────────
export function birthYearValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const year = new Date(control.value).getFullYear();
    if (year > 2006) return { tooYoung: true };
    return null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule,
    MatInputModule, MatSliderModule, MatRadioModule, MatDatepickerModule,
    MatNativeDateModule, MatSlideToggleModule, ReactiveFormsModule, FormsModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {

  // REQUIREMENT 3: Dark / Light toggle
  darkMode = false;
  toggleDarkMode(): void { this.darkMode = !this.darkMode; }

  formdata: FormGroup = new FormGroup({
    fullName:        new FormControl('',   [Validators.required]),
    studentId:       new FormControl('',   [Validators.required]),
    email:           new FormControl('',   [Validators.required, Validators.email]),
    password:        new FormControl('',   [Validators.required, passwordValidator()]),
    gender:          new FormControl('',   [Validators.required]),
    birthDate:       new FormControl(null, [Validators.required, birthYearValidator()]),
    course:          new FormControl('',   [Validators.required]),
    yearLevel:       new FormControl('',   [Validators.required]),
    eventExperience: new FormControl(1),
    agreeToTerms:    new FormControl(false, [Validators.requiredTrue]),
  });

  submitted = false;
  fullName = ''; studentId = ''; email = ''; password = '';
  gender = ''; birthDate!: Date; course = ''; yearLevel = '';
  eventExperience = 1; minExp = 1; maxExp = 10;

  selectedCourse = ''; courseSelectOpen = false;
  courses: string[] = [
    'BS Computer Science', 'BS Information Technology',
    'BS Computer Engineering', 'BS Electronics Engineering',
    'BS Business Administration', 'BS Accountancy',
    'BS Nursing', 'BS Education', 'Other',
  ];

  allEventTypes: string[] = ['Academic','Sports','Cultural','Tech Talk','Leadership','Community Service','Arts'];
  activeEventTypes: Set<string> = new Set();
  get activeEventTypesArray(): string[] { return Array.from(this.activeEventTypes); }

  get profileCompletion(): number {
    let n = 0; const f = this.formdata.controls;
    if (f['fullName'].valid  && f['fullName'].value)  n++;
    if (f['studentId'].valid && f['studentId'].value) n++;
    if (f['email'].valid     && f['email'].value)     n++;
    if (f['password'].valid  && f['password'].value)  n++;
    if (f['birthDate'].valid && f['birthDate'].value) n++;
    if (f['gender'].value)                            n++;
    if (this.selectedCourse)                          n++;
    if (f['yearLevel'].value)                         n++;
    if (f['agreeToTerms'].value)                      n++;
    return Math.round((n / 9) * 100);
  }

  get sliderFillPercent(): number {
    const v = this.formdata.get('eventExperience')?.value ?? 1;
    return ((v - this.minExp) / (this.maxExp - this.minExp)) * 100;
  }

  toggleCourseSelect(e: Event): void { e.stopPropagation(); this.courseSelectOpen = !this.courseSelectOpen; }
  selectCourse(e: Event, c: string): void { e.stopPropagation(); this.selectedCourse = c; this.formdata.patchValue({ course: c }); this.courseSelectOpen = false; }

  toggleChip(t: string): void { this.activeEventTypes.has(t) ? this.activeEventTypes.delete(t) : this.activeEventTypes.add(t); }
  isChipActive(t: string): boolean { return this.activeEventTypes.has(t); }
  removeChip(e: Event, t: string): void { e.stopPropagation(); this.activeEventTypes.delete(t); }

  getPasswordError(): string {
    const c = this.formdata.controls['password'];
    if (c.hasError('required'))         return 'Password is required.';
    if (c.hasError('startsWithLetter')) return 'Password must start with a letter.';
    if (c.hasError('alphanumericOnly')) return 'Only letters and numbers allowed — no spaces or symbols.';
    if (c.hasError('tooShort'))         return 'Password must be at least 8 characters.';
    return '';
  }

  getBirthDateError(): string {
    const c = this.formdata.controls['birthDate'];
    if (c.hasError('required')) return 'Date of birth is required.';
    if (c.hasError('tooYoung')) return 'You must be born in 2006 or earlier to register.';
    return '';
  }

  onClickSubmit(data: any): void {
    if (!this.formdata.valid) { this.formdata.markAllAsTouched(); return; }
    this.submitted = true;
    this.fullName = data.fullName; this.studentId = data.studentId;
    this.email = data.email; this.password = data.password;
    this.gender = data.gender; this.birthDate = data.birthDate;
    this.course = this.selectedCourse; this.yearLevel = data.yearLevel;
    this.eventExperience = data.eventExperience;
    console.log('Submitted:', this.formdata.value);
  }
}