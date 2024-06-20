/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {
	getMyDetails,
	getMyTopItems,
	getSavedTracksBetweenMonths,
} from "@/helpers/apiCalls/userApi";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import SongCard from "../Cards/SongCard";

import {
	getFormattedDate,
	loginToastOptions,
} from "@/helpers/utilityFunctions";

import { useToast } from "@/components/ui/use-toast";
import {
	addItemsToAPlaylist,
	createPlaylist,
} from "@/helpers/apiCalls/playlistApi";
import { useRecoilValue } from "recoil";
import { authTokensAtom } from "@/store/atoms";

type Props = {};

const MonthlyPlaylistMaker = (props: Props) => {
	const { toast } = useToast();
	const access_token = useRecoilValue(authTokensAtom).accessToken;
	const [visibleTracks, setVisibleTracks] = useState<string[]>([]); //full tracks
	const [includedTracks, setIncludedTracks] = useState<string[]>([]); //spotify URIs
	const [month, setMonth] = useState<number>(1);
	const [count, setCount] = useState(0);
	const showLoginToast = () => {
		toast(loginToastOptions);
	};
	const setIncluded = async (id: string, isIncluded: boolean) => {
		if (isIncluded) {
			setIncludedTracks((prev: any) => [...prev, id]);
			console.log("included", id, "in", includedTracks);
		} else if (!isIncluded) {
			setIncludedTracks((prev) => {
				return prev.filter((trackId: string) => trackId !== id);
			});
			console.log("removed id", id, includedTracks);
		}
	};
	const previewPlaylist = async () => {
		const startDate = getFormattedDate(month);
		const endDate = getFormattedDate(month + 1);
		console.log("top level end date", startDate, " ", endDate);

		if (access_token) {
			const { requiredTrackUris, requiredTracks } =
				await getSavedTracksBetweenMonths({
					access_token,
					endDate,
					startDate,
				});
			console.log();

			setVisibleTracks(requiredTracks);
			setIncludedTracks(requiredTrackUris);
		} else {
			showLoginToast();
		}
	};

	const makeMonthlyPlaylists = async () => {
		if (!includedTracks) await previewPlaylist();
		const startDate = getFormattedDate(month);
		const endDate = getFormattedDate(month + 1);
		if (access_token) {
			const currentUser = await getMyDetails(access_token);
			const currentUserId = currentUser.id;

			if (includedTracks.length === 0) {
				toast({
					title: "No tracks found",
					description: `There are no songs saved between ${startDate} and ${endDate}`,
					duration: 5000,
				});
			} else {
				let newPlaylistId = await createPlaylist({
					access_token,
					description: `Monthly Playlist ${startDate}`,
					isPublic: false,
					name: "monthly playlist for you :3",
					userId: currentUserId,
				});
				newPlaylistId = newPlaylistId.id;
				console.log("tracks to put in the monthly playlist", includedTracks);

				addItemsToAPlaylist({
					access_token,
					playlistId: newPlaylistId,
					uris: includedTracks,
					postion: 0,
				});
			}
		}
	};

	useEffect(() => {
		console.log("new included tracks", includedTracks);
	}, [includedTracks]);
	return (
		<div className="flex flex-col items-center justify-center w-full min-h-screen md:px-20 px-5">
			<h1 className="text-5xl font-extrabold uppercase bg-gradient-to-r from-accent to-popover text-transparent bg-clip-text p-3 text-center">
				make a monthly playlist
			</h1>
			<div className="flex flex-col gap-3 items-center my-5">
				<SelectMonth onValueChange={setMonth} />
				<button
					className="btn btn-primary rounded-full btn-sm"
					onClick={makeMonthlyPlaylists}
				>
					Make Monthly Playlist
				</button>
				<button
					className="btn btn-primary rounded-full btn-sm"
					onClick={previewPlaylist}
				>
					preview songs
				</button>
			</div>
			<div className="grid lg:grid-cols-4 md:grid-cols-3 gap-3">
				{visibleTracks &&
					visibleTracks.map((track: any, index: number) => {
						return (
							<SongCard
								key={index}
								albumId={track.album.id}
								albumImage={track.album.images[0].url}
								albumName={track.album.name}
								artistIds={track.artists.map((artist: any) => artist.id)}
								artistsName={track.artists.map((artist: any) => artist.name)}
								id={track.id}
								name={track.name}
								popularity={track.popularity}
								setIncluded={setIncluded}
							/>
						);
					})}
			</div>
		</div>
	);
};

export default MonthlyPlaylistMaker;

export function SelectMonth(props: { onValueChange: any }) {
	return (
		<select
			className="select select-primary bg-transparent select-sm rounded-full"
			onChange={(e) => props.onValueChange(Number(e.target.value))}
		>
			<option disabled selected>
				Select a month
			</option>
			<option value="1">January</option>
			<option value="2">February</option>
			<option value="3">March</option>
			<option value="4">April</option>
			<option value="5">May</option>
			<option value="6">June</option>
			<option value="7">July</option>
			<option value="8">August</option>
			<option value="9">September</option>
			<option value="10">October</option>
			<option value="11">November</option>
			<option value="12">December</option>
		</select>
	);
}