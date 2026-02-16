import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ClubSelector from '~/components/ClubSelector.vue'
import { useClubStore } from '~/stores/useClubStore'

describe('ClubSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should mount successfully', () => {
    const wrapper = mount(ClubSelector)
    expect(wrapper.exists()).toBe(true)
  })

  it('should initialize showModal as false', () => {
    const wrapper = mount(ClubSelector)
    expect(wrapper.vm.showModal).toBe(false)
  })

  it('should use club store', () => {
    const store = useClubStore()
    store.setSelectedClub({
      id: '1',
      name: 'Test Club',
      city: 'Test City',
    })

    const wrapper = mount(ClubSelector)

    expect(wrapper.vm.clubStore.selectedClub?.name).toBe('Test Club')
  })

  it('should call selectClub method correctly', () => {
    const store = useClubStore()
    const wrapper = mount(ClubSelector)
    const testClub = { id: '1', name: 'Test Club', city: 'Test City' }

    wrapper.vm.selectClub(testClub)

    expect(store.selectedClub?.id).toBe('1')
    expect(wrapper.vm.showModal).toBe(false)
  })

  it('should toggle modal state', async () => {
    const wrapper = mount(ClubSelector)

    expect(wrapper.vm.showModal).toBe(false)

    wrapper.vm.showModal = true
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.showModal).toBe(true)

    wrapper.vm.showModal = false
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.showModal).toBe(false)
  })
})
