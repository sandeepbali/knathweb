/* ============================================
   Main JS - Navigation, Scroll Reveals,
   Interactive Elements, Counters
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Mark JS as loaded for CSS fallback scoping
  document.documentElement.classList.add('js-loaded')

  // --- Loading Screen ---
  const loader = document.querySelector('.loader')
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden')
        document.body.style.overflow = ''
        initHeroAnimations()
      }, 800)
    })
    // Fallback: hide loader after 3s regardless
    setTimeout(() => {
      loader.classList.add('hidden')
      document.body.style.overflow = ''
      initHeroAnimations()
    }, 3000)
  } else {
    initHeroAnimations()
  }

  // --- Navigation Scroll Effect ---
  const nav = document.querySelector('.nav')
  let lastScroll = 0

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset
    if (currentScroll > 50) {
      nav.classList.add('scrolled')
    } else {
      nav.classList.remove('scrolled')
    }
    lastScroll = currentScroll
  }, { passive: true })

  // --- Mobile Navigation ---
  const hamburger = document.querySelector('.nav__hamburger')
  const mobileOverlay = document.querySelector('.nav__mobile-overlay')

  if (hamburger && mobileOverlay) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open')
      mobileOverlay.classList.toggle('open')
      document.body.style.overflow = mobileOverlay.classList.contains('open') ? 'hidden' : ''
    })

    // Close on link click
    mobileOverlay.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open')
        mobileOverlay.classList.remove('open')
        document.body.style.overflow = ''
      })
    })
  }

  // --- Scroll Reveal (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal')

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        // Don't unobserve for re-trigger if needed, but for perf we do
        revealObserver.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  revealElements.forEach(el => revealObserver.observe(el))

  // --- Counter Animation ---
  const counters = document.querySelectorAll('[data-count]')

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target)
        counterObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.5 })

  counters.forEach(el => counterObserver.observe(el))

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'))
    const suffix = el.getAttribute('data-suffix') || ''
    const prefix = el.getAttribute('data-prefix') || ''
    const duration = 2000
    const startTime = performance.now()

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(eased * target)
      el.textContent = prefix + current + suffix

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        el.textContent = prefix + target + suffix
      }
    }

    requestAnimationFrame(update)
  }

  // --- Hero Animations (staggered reveals) ---
  function initHeroAnimations() {
    const heroElements = document.querySelectorAll('.hero__overline, .hero__title, .hero__description, .hero__stats, .hero__image-container')
    heroElements.forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1'
        el.style.transform = 'translate(0, 0)'
        el.style.transition = `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) , transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)`
      }, 200 + i * 150)
    })
  }

  // --- Glow Card Mouse Tracking ---
  document.querySelectorAll('.glow-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      card.style.setProperty('--glow-x', x + 'px')
      card.style.setProperty('--glow-y', y + 'px')
    })
  })

  // --- Smooth Anchor Scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'))
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })

  // --- Timeline: Auto-wrap milestones with node/connector/card structure ---
  document.querySelectorAll('.milestones .milestone').forEach(ms => {
    // Only wrap if not already wrapped
    if (ms.querySelector('.milestone__card')) return

    // Create node
    const node = document.createElement('div')
    node.className = 'milestone__node'

    // Create connector
    const connector = document.createElement('div')
    connector.className = 'milestone__connector'

    // Wrap existing children in a card div
    const card = document.createElement('div')
    card.className = 'milestone__card'
    while (ms.firstChild) {
      card.appendChild(ms.firstChild)
    }

    ms.appendChild(node)
    ms.appendChild(connector)
    ms.appendChild(card)
  })

  // --- Timeline Scroll Animation ---
  const timelines = document.querySelectorAll('.milestones')
  timelines.forEach(timeline => {
    // Observe each milestone for staggered reveal
    const milestones = timeline.querySelectorAll('.milestone')
    const milestoneObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('milestone--visible')
          milestoneObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })

    milestones.forEach(ms => milestoneObserver.observe(ms))

    // Glow tracking on milestone cards
    timeline.querySelectorAll('.milestone__card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px')
        card.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px')
      })
    })
  })

  // Timeline progress line on scroll
  if (timelines.length > 0) {
    function updateTimelineProgress() {
      timelines.forEach(timeline => {
        const rect = timeline.getBoundingClientRect()
        const windowH = window.innerHeight
        const timelineTop = rect.top
        const timelineH = rect.height
        if (timelineTop < windowH && rect.bottom > 0) {
          const scrolled = Math.min(Math.max((windowH - timelineTop) / (timelineH + windowH), 0), 1)
          timeline.style.setProperty('--timeline-progress', (scrolled * 100) + '%')
        }
      })
    }
    window.addEventListener('scroll', updateTimelineProgress, { passive: true })
    updateTimelineProgress()
  }

  // --- Parallax Effect for Float Elements ---
  const floatElements = document.querySelectorAll('.float-element')
  if (floatElements.length > 0 && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset
      floatElements.forEach(el => {
        const speed = el.getAttribute('data-speed') || 0.1
        el.style.transform = `translateY(${scrollY * speed}px)`
      })
    }, { passive: true })
  }

  // --- Ticker Duplication for Seamless Loop ---
  const tickerInners = document.querySelectorAll('.ticker__inner')
  tickerInners.forEach(ticker => {
    const items = ticker.innerHTML
    ticker.innerHTML = items + items
  })

  // --- Active Nav Link Highlighting ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html'
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href')
    if (href && (href.endsWith(currentPage) || (currentPage === 'index.html' && href.endsWith('/')))) {
      link.classList.add('active')
    }
  })

  // Active link for mobile nav too
  document.querySelectorAll('.nav__mobile-overlay .nav__link').forEach(link => {
    const href = link.getAttribute('href')
    if (href && (href.endsWith(currentPage) || (currentPage === 'index.html' && href.endsWith('/')))) {
      link.classList.add('active')
    }
  })

})
