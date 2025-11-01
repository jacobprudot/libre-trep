// Type definitions for LibreTrep Electoral System

export type ActaType = 'PRESIDENCIAL' | 'DEPARTAMENTAL' | 'MUNICIPAL'

export type ActaStatus =
  | 'PENDING'
  | 'OCR_PROCESSING'
  | 'OCR_COMPLETE'
  | 'REQUIRES_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'

export type VoteSource = 'MANUAL' | 'OCR'

export type UserRole =
  | 'DELEGADO'
  | 'COORDINADOR_DEPARTAMENTAL'
  | 'COORDINADOR_NACIONAL'
  | 'ANALISTA'
  | 'ADMIN'

export interface Delegate {
  id: string
  dni: string
  qrCode: string
  fullName: string
  phone: string
  latitude: number
  longitude: number
  deviceInfo?: any
  centerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface VotingCenter {
  id: string
  code: string
  name: string
  address: string
  departmentId: string
  municipalityId: string
  latitude: number
  longitude: number
  registeredVoters: number
}

export interface Acta {
  id: string
  code: string
  type: ActaType
  delegateId: string
  centerId: string
  departmentId: string
  municipalityId: string
  imageUrl: string
  imageHash: string
  status: ActaStatus
  ocrProcessed: boolean
  ocrConfidence?: number
  ocrResults?: any
  verified: boolean
  verifiedBy?: string
  verifiedAt?: Date
  observations?: string
  capturedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Vote {
  id: string
  actaId: string
  partyId: string
  votes: number
  source: VoteSource
  createdAt: Date
}

export interface Party {
  id: string
  code: string // DC, PINU, LIBRE, PL, PN
  name: string
  color?: string
  logo?: string
  order: number
}

export interface Department {
  id: string
  code: string
  name: string
}

export interface Municipality {
  id: string
  code: string
  name: string
  departmentId: string
}

// Authentication types
export interface AuthResponse {
  success: boolean
  token?: string
  delegate?: Delegate
  message?: string
}

export interface LoginRequest {
  dni: string
  qrCode: string
  phone: string
  latitude: number
  longitude: number
  deviceInfo?: any
}

// Acta upload types
export interface ActaUploadRequest {
  code: string
  type: ActaType
  image: File
  delegateId: string
  centerId: string
}

export interface VoteInput {
  partyId: string
  votes: number
}

export interface ManualVotesRequest {
  actaId: string
  votes: VoteInput[]
}

// Dashboard types
export interface DashboardStats {
  totalActas: number
  processedActas: number
  pendingActas: number
  verifiedActas: number
  progressPercentage: number
  estimatedTimeRemaining?: number
}

export interface DepartmentProgress {
  departmentId: string
  departmentName: string
  total: number
  processed: number
  percentage: number
}

export interface PartyResults {
  partyId: string
  partyCode: string
  partyName: string
  votes: number
  percentage: number
}

// GPS types
export interface GPSCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface GPSValidation {
  valid: boolean
  distance?: number // meters from assigned center
  message?: string
}
