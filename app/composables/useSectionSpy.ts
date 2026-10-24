import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { MaybeRefOrGetter } from 'vue'
import type { NavSection } from '~/data/site'

/** Highlights `nav` in the header while the section crosses the middle of the viewport. */
export function useSectionSpy(el: MaybeRefOrGetter<HTMLElement | null | undefined>, nav: NavSection) {
  const ui = useUiStore()

  useGsap(() => {
    const trigger = toValue(el)
    if (!trigger) return

    ScrollTrigger.create({
      trigger,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) ui.activeSection = nav
        else if (ui.activeSection === nav) ui.activeSection = null
      },
    })

    return () => {
      if (ui.activeSection === nav) ui.activeSection = null
    }
  }, el)
}
