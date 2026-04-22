"use client";

import DaumPostcode from "react-daum-postcode";

interface DaumAddressData {
  zonecode: string;
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
}

interface AddressSearchProps {
  onComplete: (data: { zonecode: string; address: string }) => void; // 주소 선택 시 부모에게 데이터를 넘길 함수
  onClose: () => void; // 닫기 버튼용 함수
}

export default function AddressSearch({
  onComplete,
  onClose,
}: AddressSearchProps) {
  // 다음 우편번호 API가 주소를 선택했을 때 실행하는 함수
  const handleComplete = (data: DaumAddressData) => {
    let fullAddress = data.address;
    let extraAddress = "";

    // 도로명 주소일 때 참고항목(동, 건물명) 조합 로직
    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    // 부모 컴포넌트로 선택된 데이터(우편번호, 주소) 전달
    onComplete({
      zonecode: data.zonecode,
      address: fullAddress,
    });
  };

  // 모달 스타일 (Tailwind CSS 기준 예시)
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded bg-white p-4 shadow-lg">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* 다음 주소 검색 컴포넌트 */}
        <DaumPostcode onComplete={handleComplete} className="h-[80vh] w-full" />
      </div>
    </div>
  );
}
