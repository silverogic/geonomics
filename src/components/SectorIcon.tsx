import React from 'react'
import {
  Cpu,
  Server,
  Landmark,
  HeartPulse,
  Factory,
  Flame,
  ShoppingCart,
  Car,
  ShoppingBag,
  Utensils,
  Radio,
  FlaskConical,
  Zap,
  Ship,
  Gem,
  HardHat,
  Briefcase,
  Truck,
  Building2,
  Layers,
} from 'lucide-react'

interface SectorIconProps {
  sectorKey: string
  className?: string
}

/**
 * Renders standardized vector Lucide icons for stock market sectors,
 * matching the clean iconography of the Economic News section.
 */
export const SectorIcon: React.FC<SectorIconProps> = ({
  sectorKey,
  className = 'w-3.5 h-3.5 shrink-0',
}) => {
  switch (sectorKey) {
    case 'All':
      return <Layers className={className} />
    case 'Electronic Technology':
      return <Cpu className={className} />
    case 'Technology Services':
      return <Server className={className} />
    case 'Finance':
      return <Landmark className={className} />
    case 'Health Technology':
    case 'Health Services':
      return <HeartPulse className={className} />
    case 'Producer Manufacturing':
      return <Factory className={className} />
    case 'Energy Minerals':
      return <Flame className={className} />
    case 'Retail Trade':
      return <ShoppingCart className={className} />
    case 'Consumer Durables':
      return <Car className={className} />
    case 'Consumer Non-Durables':
      return <ShoppingBag className={className} />
    case 'Consumer Services':
      return <Utensils className={className} />
    case 'Communications':
      return <Radio className={className} />
    case 'Process Industries':
      return <FlaskConical className={className} />
    case 'Utilities':
      return <Zap className={className} />
    case 'Transportation':
      return <Ship className={className} />
    case 'Non-Energy Minerals':
      return <Gem className={className} />
    case 'Industrial Services':
      return <HardHat className={className} />
    case 'Commercial Services':
      return <Briefcase className={className} />
    case 'Distribution Services':
      return <Truck className={className} />
    default:
      return <Building2 className={className} />
  }
}
