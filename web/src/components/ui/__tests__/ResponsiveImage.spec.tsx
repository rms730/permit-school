import React from 'react';
import { screen, act } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { ResponsiveImage } from '../ResponsiveImage';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, onLoad, onError, fill: _fill, priority: _priority, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      onLoad={onLoad} 
      onError={onError}
      {...props}
    />
  ),
}));

describe('ResponsiveImage', () => {
  it('renders with basic props', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('renders with width and height', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        width={300}
        height={200}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('width', '300');
    expect(image).toHaveAttribute('height', '200');
  });

  it('renders with custom ratio', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        width={400}
        ratio={4/3}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('renders with fill prop', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        fill={true}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('renders with priority prop', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        priority={true}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('renders with custom sizes', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        ref={ref}
      />
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies custom className', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        className="custom-class"
      />
    );

    const container = screen.getByAltText('Test image').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('applies custom sx styles', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        sx={{ backgroundColor: 'red' }}
      />
    );

    const container = screen.getByAltText('Test image').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('calls onLoad callback when image loads', async () => {
    const onLoadMock = vi.fn();
    
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        onLoad={onLoadMock}
      />
    );

    const image = screen.getByAltText('Test image');
    await act(async () => {
      image.dispatchEvent(new Event('load'));
    });
    
    expect(onLoadMock).toHaveBeenCalledTimes(1);
  });

  it('calls onError callback when image fails to load', async () => {
    const onErrorMock = vi.fn();
    
    renderWithProviders(
      <ResponsiveImage 
        src="/invalid-image.jpg" 
        alt="Test image" 
        onError={onErrorMock}
      />
    );

    const image = screen.getByAltText('Test image');
    await act(async () => {
      image.dispatchEvent(new Event('error'));
    });
    
    expect(onErrorMock).toHaveBeenCalledTimes(1);
  });

  it('shows error state when image fails to load', async () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/invalid-image.jpg" 
        alt="Test image" 
      />
    );

    const image = screen.getByAltText('Test image');
    await act(async () => {
      image.dispatchEvent(new Event('error'));
    });
    
    // Should show error message
    expect(screen.getByText('Image failed to load')).toBeInTheDocument();
  });

  it('shows skeleton while loading', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
      />
    );

    // Should show skeleton initially
    const skeleton = document.querySelector('[class*="MuiSkeleton-root"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('hides skeleton when image loads', async () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
      />
    );

    const image = screen.getByAltText('Test image');
    await act(async () => {
      image.dispatchEvent(new Event('load'));
    });
    
    // Skeleton should be hidden after load
    const skeleton = document.querySelector('[class*="MuiSkeleton-root"]');
    expect(skeleton).not.toBeInTheDocument();
  });

  it('handles image with no width or height', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
  });

  it('handles image with only width', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        width={300}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('width', '300');
  });

  it('handles image with only height', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Test image" 
        height={200}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('height', '200');
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt="Accessible image description"
      />
    );

    const image = screen.getByAltText('Accessible image description');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Accessible image description');
  });

  it('handles long alt text', () => {
    const longAltText = 'This is a very long alt text description that should be handled properly by the component without breaking the layout or causing any rendering issues. It should be accessible to screen readers.';
    
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt={longAltText}
      />
    );

    const image = screen.getByAltText(longAltText);
    expect(image).toBeInTheDocument();
  });

  it('handles special characters in alt text', () => {
    const specialAltText = 'Image with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
    
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt={specialAltText}
      />
    );

    const image = screen.getByAltText(specialAltText);
    expect(image).toBeInTheDocument();
  });

  it('handles empty alt text', () => {
    renderWithProviders(
      <ResponsiveImage 
        src="/test-image.jpg" 
        alt=""
      />
    );

    const image = screen.getByAltText('');
    expect(image).toBeInTheDocument();
  });

  it('handles data URLs', () => {
    const dataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9zdmc+';
    
    renderWithProviders(
      <ResponsiveImage 
        src={dataUrl} 
        alt="Data URL image"
      />
    );

    const image = screen.getByAltText('Data URL image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', dataUrl);
  });

  it('handles external URLs', () => {
    const externalUrl = 'https://example.com/image.jpg';
    
    renderWithProviders(
      <ResponsiveImage 
        src={externalUrl} 
        alt="External image"
      />
    );

    const image = screen.getByAltText('External image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', externalUrl);
  });
});
