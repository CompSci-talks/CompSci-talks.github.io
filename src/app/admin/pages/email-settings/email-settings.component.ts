import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-email-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './email-settings.component.html'
})
export class EmailSettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private firestore = inject(Firestore);
    private toastService = inject(ToastService);

    settingsForm: FormGroup;
    isLoading = false;
    isSaving = false;

    constructor() {
        this.settingsForm = this.fb.group({
            serviceId: ['', [Validators.required]],
            templateId: ['', [Validators.required]],
            publicKey: ['', [Validators.required]]
        });
    }

    async ngOnInit() {
        this.isLoading = true;
        try {
            const configDocRef = doc(this.firestore, 'email_config', 'smtp');
            const configSnap = await getDoc(configDocRef);
            if (configSnap.exists()) {
                this.settingsForm.patchValue(configSnap.data());
            }
        } catch (error) {
            console.error('Error loading email settings:', error);
            this.toastService.error('Failed to load email settings.');
        } finally {
            this.isLoading = false;
        }
    }

    async saveSettings() {
        if (this.settingsForm.invalid) return;

        this.isSaving = true;
        try {
            const configDocRef = doc(this.firestore, 'email_config', 'smtp');
            await setDoc(configDocRef, this.settingsForm.value);
            this.toastService.success('Email settings saved successfully.');
        } catch (error) {
            console.error('Error saving email settings:', error);
            this.toastService.error('Failed to save email settings.');
        } finally {
            this.isSaving = false;
        }
    }
}
