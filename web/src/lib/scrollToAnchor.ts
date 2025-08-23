/**
 * Utility function to scroll to an anchor element with proper offset for sticky header
 */
export function scrollToAnchor(anchorId: string, additionalOffset: number = 20) {
  const element = document.querySelector(anchorId);
  if (element) {
    // Get the header height to account for sticky positioning
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Calculate the target scroll position
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const targetScrollTop = elementTop - headerHeight - additionalOffset;
    
    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }
}
