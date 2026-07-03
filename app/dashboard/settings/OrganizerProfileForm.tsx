'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, type FormEvent, useRef, useState, useTransition } from 'react'
import { updateOrganizerProfile } from './actions'

type Props = {
  organizerId: string
  displayName: string
  email: string
  bio: string
  logoUrl: string | null
  tiktokUrl: string
  instagramUrl: string
  snapchatUrl: string
}

const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]'
const socialInputClass = 'w-full rounded-lg border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]'

type SocialErrors = {
  tiktokUrl?: string
  instagramUrl?: string
  snapchatUrl?: string
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3v11.5a4.5 4.5 0 1 1-4.5-4.5" />
      <path d="M14 5a6 6 0 0 0 6 6" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M17.5 6.5h.01" />
    </svg>
  )
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3c-2.6 0-4.5 2-4.5 4.7v2.1c0 1.1-.7 2.1-1.8 2.6l-1.2.5c.5 1.2 1.7 1.9 3.1 2 .5 1.5 1.9 2.6 4.4 2.6s3.9-1.1 4.4-2.6c1.4-.1 2.6-.8 3.1-2l-1.2-.5c-1.1-.5-1.8-1.5-1.8-2.6V7.7C16.5 5 14.6 3 12 3Z" />
      <path d="M9.5 20c.8.6 1.6.9 2.5.9s1.7-.3 2.5-.9" />
    </svg>
  )
}

const tiktokPattern = /^https:\/\/((www\.)?tiktok\.com\/@|vm\.tiktok\.com\/)/
const instagramPattern = /^https:\/\/(www\.)?instagram\.com\//
const snapchatPattern = /^https:\/\/(www\.)?snapchat\.com\/add\//

function getSocialErrors(values: {
  tiktokUrl: string
  instagramUrl: string
  snapchatUrl: string
}): SocialErrors {
  const errors: SocialErrors = {}
  if (values.tiktokUrl.trim() && !tiktokPattern.test(values.tiktokUrl.trim())) {
    errors.tiktokUrl = 'Use a TikTok profile URL such as https://tiktok.com/@handle.'
  }
  if (values.instagramUrl.trim() && !instagramPattern.test(values.instagramUrl.trim())) {
    errors.instagramUrl = 'Use an Instagram URL such as https://instagram.com/handle.'
  }
  if (values.snapchatUrl.trim() && !snapchatPattern.test(values.snapchatUrl.trim())) {
    errors.snapchatUrl = 'Use a Snapchat add URL such as https://snapchat.com/add/handle.'
  }
  return errors
}

export default function OrganizerProfileForm({
  organizerId,
  displayName,
  email,
  bio,
  logoUrl,
  tiktokUrl,
  instagramUrl,
  snapchatUrl,
}: Props) {
  const router = useRouter()
  const avatarFileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(displayName)
  const [bioValue, setBioValue] = useState(bio)
  const [logoUrlValue, setLogoUrlValue] = useState<string | null>(logoUrl)
  const [tiktokUrlValue, setTiktokUrlValue] = useState(tiktokUrl)
  const [instagramUrlValue, setInstagramUrlValue] = useState(instagramUrl)
  const [snapchatUrlValue, setSnapchatUrlValue] = useState(snapchatUrl)
  const [socialErrors, setSocialErrors] = useState<SocialErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const validateSocialLinks = () => {
    const nextSocialErrors = getSocialErrors({
      tiktokUrl: tiktokUrlValue,
      instagramUrl: instagramUrlValue,
      snapchatUrl: snapchatUrlValue,
    })
    setSocialErrors(nextSocialErrors)
    if (Object.keys(nextSocialErrors).length > 0) {
      setError('Fix the social link URLs before saving.')
      return false
    }
    return true
  }

  const profilePayload = (nextLogoUrl?: string | null) => {
    const payload = {
      displayName: name,
      bio: bioValue,
      tiktokUrl: tiktokUrlValue,
      instagramUrl: instagramUrlValue,
      snapchatUrl: snapchatUrlValue,
    }
    return typeof nextLogoUrl === 'undefined' ? payload : { ...payload, logoUrl: nextLogoUrl }
  }

  const saveProfilePhoto = async (nextLogoUrl: string | null) => {
    if (!validateSocialLinks()) return false
    const result = await updateOrganizerProfile(profilePayload(nextLogoUrl))
    if (!result.ok) {
      setError(result.message)
      return false
    }
    setLogoUrlValue(nextLogoUrl)
    setMessage(nextLogoUrl ? 'Profile photo updated.' : 'Profile photo removed.')
    router.refresh()
    return true
  }

  const handleProfilePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setMessage(null)
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo must be under 5 MB.')
      return
    }

    setPhotoUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `avatars/${organizerId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(path, file, { contentType: file.type, upsert: true })

    if (uploadError) {
      setError('Upload failed. Try again.')
      setPhotoUploading(false)
      if (avatarFileRef.current) avatarFileRef.current.value = ''
      return
    }

    const { data } = supabase.storage.from('event-images').getPublicUrl(path)
    await saveProfilePhoto(data.publicUrl)
    setPhotoUploading(false)
    if (avatarFileRef.current) avatarFileRef.current.value = ''
  }

  const handleRemovePhoto = async () => {
    setMessage(null)
    setError(null)
    setPhotoUploading(true)
    await saveProfilePhoto(null)
    setPhotoUploading(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setError(null)
    if (!validateSocialLinks()) return

    startTransition(async () => {
      const result = await updateOrganizerProfile(profilePayload())
      if (!result.ok) {
        setError(result.message)
        return
      }

      setMessage('Changes saved.')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold text-gray-900">Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="mb-2 block text-sm font-medium text-gray-700">Profile photo</p>
            <div className="flex items-center gap-4">
              {logoUrlValue ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrlValue} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3d3d3d]/10 text-2xl font-bold text-[#3d3d3d]">
                  {name.trim()[0]?.toUpperCase() ?? 'T'}
                </div>
              )}
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={photoUploading}
                className="rounded-lg border border-[#3d3d3d] px-4 py-2 text-sm font-semibold text-[#3d3d3d] transition-colors hover:bg-gray-100 disabled:opacity-60"
              >
                {photoUploading ? 'Uploading...' : 'Upload photo'}
              </button>
              {logoUrlValue && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoUploading}
                  className="text-sm font-medium text-gray-400 transition-colors hover:text-red-500 disabled:opacity-60"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="display-name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Display name
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              className={inputClass}
              placeholder="Your organizer name"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <span className="text-xs text-gray-400">{bioValue.length}/500</span>
            </div>
            <textarea
              id="bio"
              value={bioValue}
              onChange={(event) => setBioValue(event.target.value)}
              maxLength={500}
              rows={5}
              className={inputClass}
              placeholder="Tell attendees about your organization"
            />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Social links</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="tiktok-url" className="mb-1.5 block text-sm font-medium text-gray-700">
                  TikTok
                </label>
                <div className="relative">
                  <TikTokIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="tiktok-url"
                    value={tiktokUrlValue}
                    onChange={(event) => {
                      setTiktokUrlValue(event.target.value)
                      setSocialErrors((current) => ({ ...current, tiktokUrl: undefined }))
                    }}
                    className={socialInputClass}
                    placeholder="https://tiktok.com/@handle"
                  />
                </div>
                {socialErrors.tiktokUrl && <p className="mt-1 text-xs text-red-500">{socialErrors.tiktokUrl}</p>}
              </div>

              <div>
                <label htmlFor="instagram-url" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <div className="relative">
                  <InstagramIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="instagram-url"
                    value={instagramUrlValue}
                    onChange={(event) => {
                      setInstagramUrlValue(event.target.value)
                      setSocialErrors((current) => ({ ...current, instagramUrl: undefined }))
                    }}
                    className={socialInputClass}
                    placeholder="https://instagram.com/handle"
                  />
                </div>
                {socialErrors.instagramUrl && <p className="mt-1 text-xs text-red-500">{socialErrors.instagramUrl}</p>}
              </div>

              <div>
                <label htmlFor="snapchat-url" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Snapchat
                </label>
                <div className="relative">
                  <SnapchatIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="snapchat-url"
                    value={snapchatUrlValue}
                    onChange={(event) => {
                      setSnapchatUrlValue(event.target.value)
                      setSocialErrors((current) => ({ ...current, snapchatUrl: undefined }))
                    }}
                    className={socialInputClass}
                    placeholder="https://snapchat.com/add/handle"
                  />
                </div>
                {socialErrors.snapchatUrl && <p className="mt-1 text-xs text-red-500">{socialErrors.snapchatUrl}</p>}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#3d3d3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a] disabled:opacity-60"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Account</h2>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
          <p className="mt-1 text-sm text-gray-700">{email}</p>
          <p className="mt-2 text-xs text-gray-400">This email cannot be changed here.</p>
        </div>
      </section>
    </div>
  )
}
