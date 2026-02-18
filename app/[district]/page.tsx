import { getRamadanData } from '../lib/data';
import RamadanDashboard from '../components/RamadanDashboard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ district: string }>;
}

export async function generateStaticParams() {
    const data = await getRamadanData();
    return data.districts.map((district) => ({
        district: district.name,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const param = await params;
    const districtName = decodeURIComponent(param.district);
    return {
        title: `${districtName} Ramadan Calender 2025 - Filoix`,
        description: `Get accurate Sehri and Iftar times for ${districtName}, Bangladesh. Ramadan 2025 Calendar and Planner by Filoix.`,
    };
}

export default async function DistrictPage({ params }: Props) {
    const param = await params;
    const districtName = decodeURIComponent(param.district);
    const data = await getRamadanData();
    const district = data.districts.find(d => d.name.toLowerCase() === districtName.toLowerCase());

    if (!district) {
        notFound();
    }

    return <RamadanDashboard initialDistrict={district} />;
}
