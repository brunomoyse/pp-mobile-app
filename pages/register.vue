<template>
  <IonPage class="pp-page">
    <IonHeader :translucent="true" class="pp-header">
      <IonToolbar class="pp-toolbar">
        <IonButtons slot="start">
          <IonButton @click="goBack" fill="clear" class="pp-back-button">
            <IonIcon :icon="arrowBackOutline" />
          </IonButton>
        </IonButtons>
        <IonTitle class="pp-title">{{ t('auth.register') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true" class="pp-content">
      <div class="pp-register-container">
        <!-- Logo Section -->
        <div class="pp-logo-section">
          <div class="pp-logo">
            <img src="@/assets/icon-no-bg.png" alt="PocketPair" class="pp-logo-image" />
          </div>
          <h1 class="pp-app-title">PocketPair</h1>
          <p class="pp-app-subtitle">{{ t('auth.joinCommunity') }}</p>
        </div>

        <!-- Registration Form -->
        <form @submit.prevent="handleRegister" class="pp-register-form">
          <!-- Username Input -->
          <div class="pp-input-group">
            <IonItem class="pp-input-item" :class="{ 'pp-error': usernameError }">
              <IonIcon :icon="personOutline" slot="start" class="pp-input-icon" />
              <IonInput
                v-model="username"
                type="text"
                :placeholder="t('auth.username')"
                autocomplete="username"
                :disabled="isLoading"
                @ionInput="clearErrors"
                class="pp-input"
              />
            </IonItem>
            <div v-if="usernameError" class="pp-error-text">{{ usernameError }}</div>
          </div>

          <!-- Email Input -->
          <div class="pp-input-group">
            <IonItem class="pp-input-item" :class="{ 'pp-error': emailError }">
              <IonIcon :icon="mailOutline" slot="start" class="pp-input-icon" />
              <IonInput
                v-model="email"
                type="email"
                :placeholder="t('auth.email')"
                autocomplete="email"
                :disabled="isLoading"
                @ionInput="clearErrors"
                class="pp-input"
              />
            </IonItem>
            <div v-if="emailError" class="pp-error-text">{{ emailError }}</div>
          </div>

          <!-- Password Input -->
          <div class="pp-input-group">
            <IonItem class="pp-input-item" :class="{ 'pp-error': passwordError }">
              <IonIcon :icon="lockClosedOutline" slot="start" class="pp-input-icon" />
              <IonInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.password')"
                autocomplete="new-password"
                :disabled="isLoading"
                @ionInput="clearErrors"
                class="pp-input"
              />
              <IonButton
                slot="end"
                fill="clear"
                @click="togglePasswordVisibility"
                class="pp-password-toggle"
              >
                <IonIcon :icon="showPassword ? eyeOffOutline : eyeOutline" />
              </IonButton>
            </IonItem>
            <div v-if="passwordError" class="pp-error-text">{{ passwordError }}</div>
          </div>

          <!-- Confirm Password Input -->
          <div class="pp-input-group">
            <IonItem class="pp-input-item" :class="{ 'pp-error': confirmPasswordError }">
              <IonIcon :icon="lockClosedOutline" slot="start" class="pp-input-icon" />
              <IonInput
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                :placeholder="t('auth.confirmPassword')"
                autocomplete="new-password"
                :disabled="isLoading"
                @ionInput="clearErrors"
                class="pp-input"
              />
              <IonButton
                slot="end"
                fill="clear"
                @click="toggleConfirmPasswordVisibility"
                class="pp-password-toggle"
              >
                <IonIcon :icon="showConfirmPassword ? eyeOffOutline : eyeOutline" />
              </IonButton>
            </IonItem>
            <div v-if="confirmPasswordError" class="pp-error-text">{{ confirmPasswordError }}</div>
          </div>

          <!-- Password Requirements -->
          <div class="pp-password-requirements">
            <h4>{{ t('auth.passwordRequirements') }}</h4>
            <ul>
              <li :class="{ 'pp-valid': password.length >= 8 }">
                <IonIcon :icon="password.length >= 8 ? checkmarkOutline : closeOutline" />
                {{ t('auth.passwordLength') }}
              </li>
              <li :class="{ 'pp-valid': hasLowercase }">
                <IonIcon :icon="hasLowercase ? checkmarkOutline : closeOutline" />
                {{ t('auth.passwordLowercase') }}
              </li>
              <li :class="{ 'pp-valid': hasUppercase }">
                <IonIcon :icon="hasUppercase ? checkmarkOutline : closeOutline" />
                {{ t('auth.passwordUppercase') }}
              </li>
              <li :class="{ 'pp-valid': hasNumber }">
                <IonIcon :icon="hasNumber ? checkmarkOutline : closeOutline" />
                {{ t('auth.passwordNumber') }}
              </li>
            </ul>
          </div>

          <!-- Terms and Conditions -->
          <div class="pp-terms-group">
            <IonCheckbox
              v-model="acceptTerms"
              class="pp-checkbox"
              :disabled="isLoading"
            />
            <div class="pp-terms-label">
              <div>{{ t('auth.agreeToTerms') }}</div>
              <IonButton
                fill="clear"
                size="small"
                @click="showTerms"
                class="pp-terms-link"
                :disabled="isLoading"
              >
                {{ t('auth.termsAndConditions') }}
              </IonButton>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="authError" class="pp-auth-error">
            <IonIcon :icon="alertCircleOutline" />
            <span>{{ getErrorMessage(authError) }}</span>
          </div>

          <!-- Register Button -->
          <IonButton
            type="submit"
            expand="block"
            class="pp-register-button"
            :disabled="!isFormValid || isLoading"
          >
            <IonSpinner v-if="isRegistering" name="dots" />
            <span v-else>{{ t('auth.createAccount') }}</span>
          </IonButton>
        </form>

        <!-- Divider -->
        <div class="pp-divider">
          <span>{{ t('auth.orContinueWith') }}</span>
        </div>

        <!-- Google OAuth Button -->
        <IonButton
          expand="block"
          fill="outline"
          class="pp-google-button"
          @click="handleGoogleLogin"
          :disabled="isLoading"
        >
          <IonIcon :icon="logoGoogle" slot="start" />
          <IonSpinner v-if="isGoogleLogging" name="dots" />
          <span v-else>{{ t('auth.continueWithGoogle') }}</span>
        </IonButton>

        <!-- Login Link -->
        <div class="pp-login-link">
          <div>{{ t('auth.alreadyHaveAccount') }}</div>
          <IonButton
            fill="clear"
            @click="goToLogin"
            class="pp-link-button"
            :disabled="isLoading"
          >
            {{ t('auth.login') }}
          </IonButton>
        </div>

      </div>
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonInput,
  IonCheckbox,
  IonSpinner,
  alertController,
} from '@ionic/vue'
import {
  arrowBackOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkOutline,
  closeOutline,
  alertCircleOutline,
  logoGoogle,
} from 'ionicons/icons'
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import type { RegisterData } from '~/composables/useAuth'

const { t } = useI18n()
const router = useRouter()
const { register, loginWithGoogle, isLoading, isRegistering, isGoogleLogging, authError } = useAuth()

// Form state
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation errors
const usernameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Password validation
const hasLowercase = computed(() => /[a-z]/.test(password.value))
const hasUppercase = computed(() => /[A-Z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))
const isPasswordValid = computed(() => 
  password.value.length >= 8 && 
  hasLowercase.value && 
  hasUppercase.value && 
  hasNumber.value
)

// Form validation
const isFormValid = computed(() => {
  return (
    username.value.length > 0 &&
    email.value.length > 0 &&
    password.value.length > 0 &&
    confirmPassword.value.length > 0 &&
    isPasswordValid.value &&
    password.value === confirmPassword.value &&
    acceptTerms.value &&
    !usernameError.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  )
})

// Validate email format
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate username format
const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// Clear validation errors
const clearErrors = () => {
  usernameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
}

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Handle form submission
const handleRegister = async () => {
  clearErrors()
  
  // Validate form
  if (!username.value) {
    usernameError.value = t('auth.usernameRequired')
    return
  }
  
  if (!validateUsername(username.value)) {
    usernameError.value = t('auth.usernameInvalid')
    return
  }
  
  if (!email.value) {
    emailError.value = t('auth.emailRequired')
    return
  }
  
  if (!validateEmail(email.value)) {
    emailError.value = t('auth.emailInvalid')
    return
  }
  
  if (!password.value) {
    passwordError.value = t('auth.passwordRequired')
    return
  }
  
  if (!isPasswordValid.value) {
    passwordError.value = t('auth.passwordRequirementsNotMet')
    return
  }
  
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = t('auth.passwordsDoNotMatch')
    return
  }
  
  if (!acceptTerms.value) {
    const alert = await alertController.create({
      header: t('auth.termsRequired'),
      message: t('auth.mustAcceptTerms'),
      buttons: [t('common.ok')],
    })
    await alert.present()
    return
  }

  try {
    const registerData: RegisterData = {
      username: username.value,
      email: email.value,
      password: password.value,
    }
    
    const user = await register(registerData)
    
    if (user) {
      // Show success message and redirect
      const alert = await alertController.create({
        header: t('auth.registrationSuccess'),
        message: t('auth.welcomeMessage', { username: user.username }),
        buttons: [
          {
            text: t('common.continue'),
            handler: () => {
              router.replace('/')
            },
          },
        ],
      })
      await alert.present()
    }
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

// Handle Google OAuth login
const handleGoogleLogin = async () => {
  try {
    // In a real implementation, you would integrate with Google OAuth SDK
    const alert = await alertController.create({
      header: t('auth.googleAuth'),
      message: t('auth.googleAuthInfo'),
      buttons: [
        {
          text: t('common.cancel'),
          role: 'cancel',
        },
        {
          text: t('common.continue'),
          handler: async () => {
            // Simulate Google token (in real app, get from Google SDK)
            const mockGoogleToken = 'mock-google-token'
            const user = await loginWithGoogle(mockGoogleToken)
            
            if (user) {
              router.replace('/')
            }
          },
        },
      ],
    })
    
    await alert.present()
  } catch (error) {
    console.error('Google login failed:', error)
  }
}

// Show terms and conditions
const showTerms = async () => {
  const alert = await alertController.create({
    header: t('auth.termsAndConditions'),
    message: t('auth.termsContent'),
    buttons: [t('common.close')],
    cssClass: 'pp-terms-alert',
  })
  
  await alert.present()
}

// Navigation
const goBack = () => {
  router.back()
}

const goToLogin = () => {
  router.push('/login')
}


// Error message helper
const getErrorMessage = (errors: any[]): string => {
  if (!errors || errors.length === 0) return ''
  return errors[0]?.message || t('auth.registrationFailed')
}
</script>

<style scoped>
.pp-page {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #18181a 0%, #1a1a1e 100%);
}

/* Header */
.pp-header {
  --background: rgba(24, 24, 26, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.pp-toolbar {
  --background: transparent;
  --border-color: #24242a;
  border-bottom: 1px solid #24242a;
}

.pp-title {
  color: #fee78a;
  font-weight: 700;
  font-size: 18px;
}

.pp-back-button {
  --color: #fee78a;
  --background-hover: rgba(254, 231, 138, 0.1);
}

/* Content */
.pp-content {
  --background: transparent;
  padding-top: 20px;
}

.pp-register-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  margin: 0 auto;
}

/* Logo Section */
.pp-logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.pp-logo {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #fee78a, #fbbf24);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 35px;
  color: #18181a;
  box-shadow: 0 8px 32px rgba(254, 231, 138, 0.3);
}

.pp-logo-image {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.pp-app-title {
  color: #fee78a;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px 0;
}

.pp-app-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

/* Form */
.pp-register-form {
  margin-bottom: 25px;
}

.pp-input-group {
  margin-bottom: 16px;
}

.pp-input-item {
  --background: rgba(36, 36, 42, 0.6);
  --border-color: #54545f;
  --border-radius: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.pp-input-item:hover {
  --border-color: #64748b;
}

.pp-input-item.ion-focused {
  --border-color: #fee78a;
  box-shadow: 0 0 0 2px rgba(254, 231, 138, 0.2);
}

.pp-input-item.pp-error {
  --border-color: #ef4444;
}

.pp-input-icon {
  color: #64748b;
  font-size: 20px;
  margin-right: 8px;
}

.pp-input {
  --color: #e2e8f0;
  --placeholder-color: #64748b;
  font-size: 16px;
}

.pp-password-toggle {
  --color: #64748b;
  --background-hover: rgba(100, 116, 139, 0.1);
  margin: 0;
}

.pp-error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  padding-left: 12px;
}

/* Password Requirements */
.pp-password-requirements {
  background: rgba(36, 36, 42, 0.4);
  border: 1px solid #54545f;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.pp-password-requirements h4 {
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pp-password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pp-password-requirements li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.pp-password-requirements li.pp-valid {
  color: #22c55e;
}

.pp-password-requirements li ion-icon {
  font-size: 14px;
}

/* Terms */
.pp-terms-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.pp-checkbox {
  --checkbox-background-checked: #fee78a;
  --border-color-checked: #fee78a;
  --checkmark-color: #18181a;
  margin-top: 2px;
}

.pp-terms-label {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.pp-terms-link {
  --color: #fee78a;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  vertical-align: baseline;
}

/* Error Display */
.pp-auth-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  color: #ef4444;
  font-size: 14px;
}

/* Buttons */
.pp-register-button {
  --background: linear-gradient(135deg, #fee78a, #fbbf24);
  --color: #18181a;
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.pp-register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(254, 231, 138, 0.4);
}

.pp-register-button:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* Divider */
.pp-divider {
  position: relative;
  text-align: center;
  margin: 25px 0;
  color: #64748b;
  font-size: 14px;
}

.pp-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #54545f;
}

.pp-divider span {
  background: #18181a;
  padding: 0 16px;
  position: relative;
  z-index: 1;
}

/* Google Button */
.pp-google-button {
  --background: transparent;
  --color: #e2e8f0;
  --border-color: #54545f;
  --border-radius: 12px;
  height: 50px;
  font-weight: 500;
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.pp-google-button:hover {
  --border-color: #64748b;
  --background: rgba(100, 116, 139, 0.1);
}

/* Links */
.pp-login-link {
  text-align: center;
  margin-bottom: 16px;
}

.pp-login-link {
  color: #94a3b8;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.pp-link-button {
  --color: #fee78a;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}


/* Responsive Design */
@media (max-width: 480px) {
  .pp-register-container {
    padding: 16px;
  }
  
  .pp-app-title {
    font-size: 24px;
  }
  
  .pp-logo {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }
  
  .pp-logo-image {
    width: 38px;
    height: 38px;
  }
  
  .pp-input-group {
    margin-bottom: 14px;
  }
}
</style>